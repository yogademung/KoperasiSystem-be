import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class StockAdjustmentService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    adjustmentDate: Date;
    inventoryItemId: number;
    warehouseId: number;
    adjustmentQty: number; // positive or negative
    reason?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Ambil inventory global
      const item = await tx.inventoryItem.findUnique({
        where: { id: data.inventoryItemId }
      });
      if (!item) throw new NotFoundException('Item tidak ditemukan');

      // 2. Ambil spesifik gudang
      let wStock = await tx.warehouseStock.findUnique({
        where: {
          warehouseId_inventoryItemId: {
            warehouseId: data.warehouseId,
            inventoryItemId: data.inventoryItemId
          }
        }
      });

      if (!wStock) {
        wStock = await tx.warehouseStock.create({
          data: {
            warehouseId: data.warehouseId,
            inventoryItemId: data.inventoryItemId,
            quantity: 0
          }
        });
      }

      // 3. Mutasi
      const newGlobalQty = Number(item.stockQty) + data.adjustmentQty;
      const newWHQty = Number(wStock.quantity) + data.adjustmentQty;

      // Update Global
      await tx.inventoryItem.update({
        where: { id: item.id },
        data: { stockQty: newGlobalQty } // avgCost doesnt change on adjustments, just physical qty mismatch
      });

      // Update Warehouse
      await tx.warehouseStock.update({
        where: { id: wStock.id },
        data: { quantity: newWHQty }
      });

      // 4. Catat histori
      return tx.stockAdjustment.create({
        data: {
          adjustmentDate: new Date(data.adjustmentDate),
          inventoryItemId: data.inventoryItemId,
          warehouseId: data.warehouseId,
          adjustmentQty: data.adjustmentQty,
          averageCost: item.averageCost,
          reason: data.reason,
          status: 'POSTED',
          createdBy: 'SYSTEM'
        }
      });
    });
  }

  async findAll() {
    return this.prisma.stockAdjustment.findMany({
      include: { inventoryItem: true, warehouse: true },
      orderBy: { adjustmentDate: 'desc' },
      take: 100
    });
  }

  async createBulkOpname(data: {
    adjustmentDate: Date;
    warehouseId: number;
    items: {
      inventoryItemId: number;
      actualQty: number;
      accountCode?: string;
      costAllocation?: string;
    }[];
  }) {
    return this.prisma.$transaction(async (tx) => {
      let insertedCount = 0;
      const passedDate = new Date(data.adjustmentDate);
      const dateStr = passedDate.toISOString().slice(0,10).replace(/-/g,'');

      const closingDateLov = await tx.lovValue.findUnique({
        where: { code_codeValue: { code: 'ACCOUNTING_SETTING', codeValue: 'CLOSING_DATE' } }
      });
      if (closingDateLov?.description) {
        const closingDate = new Date(closingDateLov.description);
        if (passedDate <= closingDate) {
          throw new BadRequestException(`Opname ditolak: Tanggal transaksi (${closingDateLov.description}) telah dikunci periode tutup buku.`);
        }
      }

      for (const item of data.items) {
        const inv = await tx.inventoryItem.findUnique({ where: { id: item.inventoryItemId } });
        if (!inv) continue;

        let wStock = await tx.warehouseStock.findUnique({
          where: { warehouseId_inventoryItemId: { warehouseId: data.warehouseId, inventoryItemId: item.inventoryItemId } }
        });

        const currentWHQty = wStock ? Number(wStock.quantity) : 0;
        const adjustmentQty = item.actualQty - currentWHQty;

        if (adjustmentQty === 0) continue; // Perfect balance

        if (!wStock) {
          wStock = await tx.warehouseStock.create({
            data: { warehouseId: data.warehouseId, inventoryItemId: item.inventoryItemId, quantity: 0 }
          });
        }

        const newGlobalQty = Number(inv.stockQty) + adjustmentQty;
        await tx.inventoryItem.update({ where: { id: inv.id }, data: { stockQty: newGlobalQty } });
        await tx.warehouseStock.update({ where: { id: wStock.id }, data: { quantity: item.actualQty } });

        await tx.stockAdjustment.create({
          data: {
            adjustmentDate: passedDate,
            inventoryItemId: item.inventoryItemId,
            warehouseId: data.warehouseId,
            adjustmentQty: adjustmentQty,
            averageCost: inv.averageCost,
            reason: `Opname Variance: Target ${item.actualQty} dari Curr ${currentWHQty}`,
            status: 'POSTED',
            createdBy: 'SYSTEM'
          }
        });

        const diffAmount = Math.abs(adjustmentQty * Number(inv.averageCost));
        if (diffAmount > 0) {
          const invCoa = '114-10'; // Nominal Persediaan
          const targetCoa = item.accountCode || (adjustmentQty < 0 ? '512-40' : '411-90'); // Biaya/Pendapatan default
          
          await tx.postedJournal.create({
            data: {
              journalNumber: `OPN-${dateStr}-${Math.floor(Math.random() * 1000)}`,
              journalDate: passedDate,
              description: `Opname ${inv.sku}: Selisih ${adjustmentQty}. Ket: ${item.costAllocation || '-'}`,
              postingType: 'AUTO',
              transType: 'STOCK_OPNAME',
              refId: item.inventoryItemId,
              userId: 1,
              status: 'POSTED',
              createdBy: 'SYSTEM',
              details: {
                create: adjustmentQty < 0 ? [
                  { accountCode: targetCoa, debit: diffAmount, credit: 0, description: 'Opname Loss/Expense' },
                  { accountCode: invCoa, debit: 0, credit: diffAmount, description: 'Persediaan Turun' }
                ] : [
                  { accountCode: invCoa, debit: diffAmount, credit: 0, description: 'Persediaan Naik' },
                  { accountCode: targetCoa, debit: 0, credit: diffAmount, description: 'Opname Gain/Income' }
                ]
              }
            }
          });
        }
        insertedCount++;
      }
      return { success: true, adjustmentsMade: insertedCount };
    });
  }
}
