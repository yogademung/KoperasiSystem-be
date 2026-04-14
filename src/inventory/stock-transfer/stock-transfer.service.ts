import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class StockTransferService {
  constructor(private prisma: PrismaService) {}

  async createTransfer(data: {
    transferDate: string;
    fromWarehouseId: number;
    toWarehouseId: number;
    items: {
      inventoryItemId: number;
      quantity: number;
      notes?: string;
    }[];
  }) {
    if (data.fromWarehouseId === data.toWarehouseId) {
      throw new BadRequestException('Gudang asal dan tujuan tidak boleh sama');
    }

    return this.prisma.$transaction(async (tx) => {
      const passedDate = new Date(data.transferDate);
      const dateStr = passedDate.toISOString().slice(0, 10).replace(/-/g, '');

      // Validasi Closing Date
      const closingDateLov = await tx.lovValue.findUnique({
        where: { code_codeValue: { code: 'ACCOUNTING_SETTING', codeValue: 'CLOSING_DATE' } },
      });
      if (closingDateLov?.description) {
        const closingDate = new Date(closingDateLov.description);
        if (passedDate <= closingDate) {
          throw new BadRequestException(
            `Transfer ditolak: Tanggal transaksi dikunci periode tutup buku (${closingDateLov.description}).`,
          );
        }
      }

      const results: any[] = [];

      for (const item of data.items) {
        if (!item.quantity || item.quantity <= 0) continue;

        const inv = await tx.inventoryItem.findUnique({ where: { id: item.inventoryItemId } });
        if (!inv) continue;

        // --- Stok Gudang Asal ---
        const fromStock = await tx.warehouseStock.findUnique({
          where: {
            warehouseId_inventoryItemId: {
              warehouseId: data.fromWarehouseId,
              inventoryItemId: item.inventoryItemId,
            },
          },
        });

        const fromQty = fromStock ? Number(fromStock.quantity) : 0;
        if (fromQty < item.quantity) {
          throw new BadRequestException(
            `Stok tidak cukup untuk item "${inv.name}" (${inv.sku}). Tersedia: ${fromQty}, diminta: ${item.quantity}`,
          );
        }

        // Kurangi gudang asal
        await tx.warehouseStock.update({
          where: { id: fromStock!.id },
          data: { quantity: { decrement: item.quantity } },
        });

        // --- Stok Gudang Tujuan ---
        const toStock = await tx.warehouseStock.findUnique({
          where: {
            warehouseId_inventoryItemId: {
              warehouseId: data.toWarehouseId,
              inventoryItemId: item.inventoryItemId,
            },
          },
        });

        if (toStock) {
          await tx.warehouseStock.update({
            where: { id: toStock.id },
            data: { quantity: { increment: item.quantity } },
          });
        } else {
          await tx.warehouseStock.create({
            data: {
              warehouseId: data.toWarehouseId,
              inventoryItemId: item.inventoryItemId,
              quantity: item.quantity,
            },
          });
        }

        // Global stockQty tidak berubah (antar gudang)

        // Nomor Transfer
        const seq = Math.floor(Math.random() * 9000) + 1000;
        const transferNumber = `TRF-${dateStr}-${seq}`;

        // Buat record transfer
        const transfer = await tx.stockTransfer.create({
          data: {
            transferNumber,
            transferDate: passedDate,
            fromWarehouseId: data.fromWarehouseId,
            toWarehouseId: data.toWarehouseId,
            inventoryItemId: item.inventoryItemId,
            quantity: item.quantity,
            averageCost: inv.averageCost,
            notes: item.notes || '',
            status: 'POSTED',
            createdBy: 'SYSTEM',
          },
        });

        results.push({ transferNumber, inventoryItemId: item.inventoryItemId, quantity: item.quantity });
      }

      return { success: true, transfersMade: results.length, transfers: results };
    });
  }

  async findAll() {
    return this.prisma.stockTransfer.findMany({
      include: {
        inventoryItem: { include: { uom: true } },
        fromWarehouse: true,
        toWarehouse: true,
      },
      orderBy: { transferDate: 'desc' },
      take: 100,
    });
  }
}
