import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class PosSaleService {
  constructor(private prisma: PrismaService) {}

  async checkout(data: {
    shiftId: number;
    paymentMethod: string;
    paymentAmount: number;
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
      await tx.lovValue.update({
        where: { code_codeValue: { code: 'STORE_SETTING', codeValue: 'POS_BILL_COUNTER' } },
        data: { description: (currentCounter + 1).toString() }
      });

      // 2. Validate Stock & Soft Booking
      const shift = await tx.posShift.findUnique({ where: { id: data.shiftId } });
      
      let totalAmount = 0;
      
      for (const item of data.items) {
        const product = await tx.posProduct.findUnique({
          where: { id: item.posProductId },
          include: { recipes: { include: { inventoryItem: true } } }
        });

        if (!product) throw new BadRequestException(`POS Product ${item.posProductId} not found.`);
        
        const lineTotal = item.quantity * item.unitPrice;
        totalAmount += lineTotal;

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

      // 3. Create Sale Record (Bridge Accounting Concept)
      // Jurnal akuntansi tidak diposting di sini. Ditampung via PosShift.
      const sale = await tx.posSale.create({
        data: {
          shiftId: data.shiftId,
          receiptNumber,
          totalAmount,
          paymentMethod: data.paymentMethod,
          paymentAmount: data.paymentAmount,
          changeAmount: data.paymentAmount - totalAmount,
          items: {
            create: data.items.map(i => ({
              posProductId: i.posProductId,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              cogsPrice: i.cogsPrice,
              totalPrice: i.quantity * i.unitPrice
            }))
          }
        },
        include: { items: true }
      });

      return sale;
    });
  }
}
