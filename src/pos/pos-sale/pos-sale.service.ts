import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class PosSaleService {
  constructor(private prisma: PrismaService) {}

  async getDrafts(shiftId: number) {
    return this.prisma.posSale.findMany({
      where: { shiftId, status: 'DRAFT' },
      include: { items: { include: { posProduct: true } } }
    });
  }

  async saveDraft(data: {
    id?: number;
    shiftId: number;
    userId: number;
    items: { posProductId: number; quantity: number; unitPrice: number; cogsPrice: number; status: string }[];
  }) {
    return this.prisma.$transaction(async (tx) => {
        const subtotalAmount = data.items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
        
        if (data.id) {
           await tx.posSaleItem.deleteMany({ where: { saleId: data.id } });
           return tx.posSale.update({
              where: { id: data.id },
              data: {
                 totalAmount: subtotalAmount,
                 items: {
                    create: data.items.map(i => ({
                       posProductId: i.posProductId,
                       quantity: i.quantity,
                       unitPrice: i.unitPrice,
                       cogsPrice: i.cogsPrice,
                       totalPrice: i.quantity * i.unitPrice,
                       createdBy: data.userId.toString()
                    }))
                 }
              },
              include: { items: { include: { posProduct: true } } }
           });
        }

        const counterSetting = await tx.lovValue.findUnique({
          where: { code_codeValue: { code: 'STORE_SETTING', codeValue: 'POS_BILL_COUNTER' } }
        });
        
        let currentCounter = parseInt(counterSetting?.description || '1');
        const receiptNumber = `POS-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${currentCounter.toString().padStart(4, '0')}`;
  
        await tx.lovValue.upsert({
          where: { code_codeValue: { code: 'STORE_SETTING', codeValue: 'POS_BILL_COUNTER' } },
          update: { description: (currentCounter + 1).toString() },
          create: {
            code: 'STORE_SETTING',
            codeValue: 'POS_BILL_COUNTER',
            description: (currentCounter + 1).toString(),
            orderNum: 1,
            isActive: true,
            createdBy: 'SYSTEM'
          }
        });

        return tx.posSale.create({
          data: {
            shiftId: data.shiftId,
            receiptNumber,
            totalAmount: subtotalAmount,
            discountAmount: 0,
            paymentMethod: 'UNPAID',
            paymentAmount: 0,
            changeAmount: 0,
            status: 'DRAFT',
            createdBy: data.userId.toString(),
            items: {
              create: data.items.map(i => ({
                posProductId: i.posProductId,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                cogsPrice: i.cogsPrice,
                totalPrice: i.quantity * i.unitPrice,
                createdBy: data.userId.toString()
              }))
            }
          },
          include: { items: { include: { posProduct: true } } }
        });
    });
  }

  async checkout(data: {
    id?: number;
    shiftId: number;
    userId: number; // Disimpan di transaksi agar bisa terlacak
    paymentMethod: string;
    paymentAmount: number;
    discountAmount?: number;
    discountNote?: string;
    items: { posProductId: number; quantity: number; unitPrice: number; cogsPrice: number }[];
  }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch Configuration
      const autoDeductSetting = await tx.lovValue.findUnique({
        where: { code_codeValue: { code: 'STORE_SETTING', codeValue: 'AUTO_DEDUCT_STOCK' } }
      });
      const autoDeduct = autoDeductSetting?.description === '1';

      const counterSetting = await tx.lovValue.findUnique({
        where: { code_codeValue: { code: 'STORE_SETTING', codeValue: 'POS_BILL_COUNTER' } }
      });
      
      let currentCounter = parseInt(counterSetting?.description || '1');
      const receiptNumber = `POS-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${currentCounter.toString().padStart(4, '0')}`;

      // Increment Counter
      if (!data.id) {
        // Increment Counter only if we are creating new sale without draft
        await tx.lovValue.upsert({
          where: { code_codeValue: { code: 'STORE_SETTING', codeValue: 'POS_BILL_COUNTER' } },
          update: { description: (currentCounter + 1).toString() },
          create: {
            code: 'STORE_SETTING',
            codeValue: 'POS_BILL_COUNTER',
            description: (currentCounter + 1).toString(),
            orderNum: 1,
            isActive: true,
            createdBy: 'SYSTEM'
          }
        });
      }

      // 2. Validate Stock & Soft Booking
      const shift = await tx.posShift.findUnique({ where: { id: data.shiftId } });
      if (!shift) throw new BadRequestException(`Shift Kasir dengan ID ${data.shiftId} tidak ditemukan atau belum dibuka.`);
      
      let subtotalAmount = 0;
      
      for (const item of data.items) {
        const product = await tx.posProduct.findUnique({
          where: { id: item.posProductId },
          include: { recipes: { include: { inventoryItem: true } } }
        });

        if (!product) throw new BadRequestException(`POS Product ${item.posProductId} not found.`);
        
        const lineTotal = item.quantity * item.unitPrice;
        subtotalAmount += lineTotal;

        // Check Inventory Recipes
        if (product.recipes.length > 0) {
          for (const recipe of product.recipes) {
            const requiredQty = Number(recipe.quantity) * item.quantity;
            const currentStock = Number(recipe.inventoryItem.stockQty);

            // Validasi Sisa Stok
            if (currentStock < requiredQty) {
              throw new BadRequestException(`Stock tidak mencukupi untuk bahan: ${recipe.inventoryItem.name}. Butuh: ${requiredQty}, Sisa: ${currentStock}`);
            }

            if (autoDeduct) {
              // Potong stok global
              await tx.inventoryItem.update({
                where: { id: recipe.inventoryItemId },
                data: { stockQty: { decrement: requiredQty } }
              });

              // Potong stok gudang spesifik jika ada warehouseId di shift
              if ((shift as any)?.warehouseId) {
                await tx.warehouseStock.upsert({
                  where: { 
                    warehouseId_inventoryItemId: { 
                      warehouseId: (shift as any).warehouseId, 
                      inventoryItemId: recipe.inventoryItemId 
                    } 
                  },
                  update: { quantity: { decrement: requiredQty } },
                  create: {
                    warehouseId: (shift as any).warehouseId,
                    inventoryItemId: recipe.inventoryItemId,
                    quantity: -requiredQty
                  }
                });
              }
            }
          }
        }
      }

      // 3. Apply Discount
      const discountAmount = data.discountAmount ?? 0;
      const totalAmount = Math.max(0, subtotalAmount - discountAmount);

      // 4. Create or Update Sale Record
      if (data.id) {
         return tx.posSale.update({
            where: { id: data.id },
            data: {
              totalAmount,
              discountAmount,
              discountNote: data.discountNote ?? null,
              paymentMethod: data.paymentMethod,
              paymentAmount: data.paymentAmount,
              changeAmount: data.paymentAmount - totalAmount,
              status: 'COMPLETED'
            },
            include: { items: true }
         });
      }

      const sale = await tx.posSale.create({
        data: {
          shiftId: data.shiftId,
          receiptNumber,
          totalAmount,
          discountAmount,
          discountNote: data.discountNote ?? null,
          paymentMethod: data.paymentMethod,
          paymentAmount: data.paymentAmount,
          changeAmount: data.paymentAmount - totalAmount,
          status: 'COMPLETED',
          createdBy: data.userId.toString(),
          items: {
            create: data.items.map(i => ({
              posProductId: i.posProductId,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              cogsPrice: i.cogsPrice,
              totalPrice: i.quantity * i.unitPrice,
              createdBy: data.userId.toString()
            }))
          }
        },
        include: { items: true }
      });

      return sale;
    });
  }
}
