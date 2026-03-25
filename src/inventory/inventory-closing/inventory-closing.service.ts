import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class InventoryClosingService {
  constructor(private prisma: PrismaService) {}

  async getClosingHistory(period?: string, warehouseId?: number) {
    return this.prisma.inventoryClosing.findMany({
      where: {
        ...(period && { period }),
        ...(warehouseId && { warehouseId }),
      },
      include: {
        warehouse: true,
        inventoryItem: {
          include: { uom: true }
        },
      },
      orderBy: [
        { period: 'desc' },
        { warehouseId: 'asc' },
      ],
    });
  }

  async runClosing(period: string, userId: string) {
    // Validasi format period YYYY-MM
    if (!/^\d{4}-\d{2}$/.test(period)) {
      throw new BadRequestException('Format periode harus YYYY-MM');
    }

    const [year, month] = period.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Cari periode sebelumnya
    const prevDate = new Date(year, month - 2, 1);
    const prevPeriod = `${prevDate.getFullYear()}-${(prevDate.getMonth() + 1).toString().padStart(2, '0')}`;

    return this.prisma.$transaction(async (tx) => {
      // 1. Ambil semua WarehouseStock (Live Stock saat ini)
      const currentStocks = await tx.warehouseStock.findMany({
        include: { inventoryItem: true }
      });

      const closings = [];

      for (const stock of currentStocks) {
        // 2. Cari Opening Stock (Ending bulan lalu)
        const prevClosing = await tx.inventoryClosing.findUnique({
          where: {
            period_warehouseId_inventoryItemId: {
              period: prevPeriod,
              warehouseId: stock.warehouseId,
              inventoryItemId: stock.inventoryItemId,
            },
          },
        });

        const openingStock = prevClosing ? prevClosing.endingStock : new Decimal(0);

        // 3. Hitung Mutasi Bulan ini
        
        // a. Receiving (Goods Receipt)
        const receiving = await tx.goodsReceiptItem.aggregate({
          where: {
            inventoryItemId: stock.inventoryItemId,
            receipt: {
              warehouseId: stock.warehouseId,
              receiptDate: { gte: startDate, lte: endDate },
              status: 'POSTED',
            },
          },
          _sum: { quantity: true },
        });

        // b. Transfers In
        const transferIn = await tx.stockTransfer.aggregate({
          where: {
            inventoryItemId: stock.inventoryItemId,
            toWarehouseId: stock.warehouseId,
            transferDate: { gte: startDate, lte: endDate },
            status: 'POSTED',
          },
          _sum: { quantity: true },
        });

        // c. Transfers Out
        const transferOut = await tx.stockTransfer.aggregate({
          where: {
            inventoryItemId: stock.inventoryItemId,
            fromWarehouseId: stock.warehouseId,
            transferDate: { gte: startDate, lte: endDate },
            status: 'POSTED',
          },
          _sum: { quantity: true },
        });

        // d. Adjustments (Opname)
        const adjustments = await tx.stockAdjustment.aggregate({
          where: {
            inventoryItemId: stock.inventoryItemId,
            warehouseId: stock.warehouseId,
            adjustmentDate: { gte: startDate, lte: endDate },
            status: 'POSTED',
          },
          _sum: { adjustmentQty: true },
        });

        // e. Sales (POS)
        const sales = await tx.posSaleItem.aggregate({
          where: {
            posProduct: {
              recipes: {
                some: { inventoryItemId: stock.inventoryItemId }
              }
            },
            sale: {
              saleDate: { gte: startDate, lte: endDate },
              status: 'COMPLETED',
              shift: { warehouseId: stock.warehouseId }
            }
          },
          _sum: { quantity: true }
        });
        
        // Note: Untuk sales stok bahan, kita harus mengalikan quantity terjual dengan quantity resep.
        // Karena aggregate _sum tidak bisa cross-resep secara langsung dengan mudah, 
        // kita ambil data penjualannya saja. 
        // Untuk akurasi resep, idealnya aggregate detail.
        const salesItems = await tx.posSaleItem.findMany({
          where: {
            posProduct: {
              recipes: { some: { inventoryItemId: stock.inventoryItemId } }
            },
            sale: {
              saleDate: { gte: startDate, lte: endDate },
              status: 'COMPLETED',
              shift: { warehouseId: stock.warehouseId }
            }
          },
          include: {
            posProduct: {
              include: {
                recipes: { where: { inventoryItemId: stock.inventoryItemId } }
              }
            }
          }
        });

        let totalSalesStock = new Decimal(0);
        for (const sItem of salesItems as any[]) {
          const recipe = sItem.posProduct?.recipes?.[0]; // Filtered by inventoryItemId above
          if (recipe) {
            const consumed = new Decimal(sItem.quantity).mul(new Decimal(recipe.quantity));
            totalSalesStock = totalSalesStock.plus(consumed);
          }
        }

        const receivingQty = receiving._sum.quantity ? new Decimal(receiving._sum.quantity as any) : new Decimal(0);
        const transferInQty = transferIn._sum.quantity ? new Decimal(transferIn._sum.quantity as any) : new Decimal(0);
        const transferOutQty = transferOut._sum.quantity ? new Decimal(transferOut._sum.quantity as any) : new Decimal(0);
        const adjustmentQty = adjustments._sum.adjustmentQty ? new Decimal(adjustments._sum.adjustmentQty as any) : new Decimal(0);

        // 4. Update/Upsert Closing Record
        // Ending stock is SNAPSHOT of live stock at the time of closing.
        const endingStockSnapshot = stock.quantity;

        const closing = await tx.inventoryClosing.upsert({
          where: {
            period_warehouseId_inventoryItemId: {
              period,
              warehouseId: stock.warehouseId,
              inventoryItemId: stock.inventoryItemId,
            },
          },
          create: {
            period,
            warehouseId: stock.warehouseId,
            inventoryItemId: stock.inventoryItemId,
            openingStock,
            receivingStock: receivingQty,
            transferInStock: transferInQty,
            transferOutStock: transferOutQty,
            adjustmentStock: adjustmentQty,
            salesStock: totalSalesStock,
            endingStock: endingStockSnapshot,
            averageCost: stock.inventoryItem.averageCost,
            closedBy: userId,
          },
          update: {
            openingStock,
            receivingStock: receivingQty,
            transferInStock: transferInQty,
            transferOutStock: transferOutQty,
            adjustmentStock: adjustmentQty,
            salesStock: totalSalesStock,
            endingStock: endingStockSnapshot,
            averageCost: stock.inventoryItem.averageCost,
            closedBy: userId,
            closedAt: new Date(),
          },
        });

        closings.push(closing);
      }

      return {
        message: `Closing inventory untuk periode ${period} berhasil dilakukan.`,
        totalItems: closings.length,
      };
    });
  }
}
