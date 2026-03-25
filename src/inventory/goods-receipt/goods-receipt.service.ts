import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class GoodsReceiptService {
  constructor(private prisma: PrismaService) {}

  async createReceipt(data: {
    receiptDate: Date;
    referenceNo: string;
    warehouseId: number;
    vendorId?: number; // Real vendor DB
    supplierName?: string; // Fallback
    isDirectPay?: boolean;
    paymentMethod?: string;
    items: { inventoryItemId: number; quantity: number; unitPrice: number }[];
  }) {
    return this.prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      data.items.forEach(i => totalAmount += (i.quantity * i.unitPrice));

      // 0. Boundary Validation
      const passedDate = new Date(data.receiptDate);
      const closingDateLov = await tx.lovValue.findUnique({
        where: { code_codeValue: { code: 'ACCOUNTING_SETTING', codeValue: 'CLOSING_DATE' } }
      });
      if (closingDateLov?.description) {
        const closingDate = new Date(closingDateLov.description);
        if (passedDate <= closingDate) {
          throw new BadRequestException(`Transaksi ditolak: Tanggal penerimaan berada pada atau sebelum Tanggal Tutup Buku Akuntansi (${closingDateLov.description}).`);
        }
      }

      // 1. Create Receipt Master
      const dateStr = passedDate.toISOString().slice(0,10).replace(/-/g,'');
      const receiptNumber = `RCV-${dateStr}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

      const receipt = await tx.goodsReceipt.create({
        data: {
          receiptNumber,
          receiptDate: passedDate,
          referenceNo: data.referenceNo,
          warehouseId: data.warehouseId,
          vendorId: data.vendorId,
          supplierName: data.supplierName,
          status: 'COMPLETED', 
          totalAmount,
          items: {
            create: data.items.map(item => ({
              inventoryItemId: item.inventoryItemId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.quantity * item.unitPrice
            }))
          }
        },
        include: { items: true }
      });

      // 2. Kalkulasi Weighted Average Cost
      for (const item of data.items) {
        const inventory = await tx.inventoryItem.findUnique({ where: { id: item.inventoryItemId } });
        if (!inventory) throw new NotFoundException('Inventory Item not found: ' + item.inventoryItemId);

        const oldQty = Number(inventory.stockQty);
        const oldAvgCost = Number(inventory.averageCost);
        const totalQty = oldQty + item.quantity;
        
        let newAvgCost = oldAvgCost; 
        if (totalQty > 0) {
          const oldTotalValue = oldQty * oldAvgCost;
          const newTotalValue = item.quantity * item.unitPrice;
          newAvgCost = (oldTotalValue + newTotalValue) / totalQty;
        }

        await tx.inventoryItem.update({
          where: { id: inventory.id },
          data: {
            stockQty: totalQty,
            averageCost: newAvgCost
          }
        });

        // 2b. Sinkronisasi multi-warehouse stock
        const wStock = await tx.warehouseStock.findUnique({
          where: {
            warehouseId_inventoryItemId: {
              warehouseId: data.warehouseId,
              inventoryItemId: item.inventoryItemId
            }
          }
        });

        if (wStock) {
          await tx.warehouseStock.update({
            where: { id: wStock.id },
            data: { quantity: Number(wStock.quantity) + item.quantity }
          });
        } else {
          await tx.warehouseStock.create({
            data: {
              warehouseId: data.warehouseId,
              inventoryItemId: item.inventoryItemId,
              quantity: item.quantity
            }
          });
        }
      }

      // 3. AP Invoice (Tagihan Hutang)
      if (data.vendorId) {
        const invoiceNo = `INV-${receiptNumber}`;
        const invoice = await tx.apInvoice.create({
          data: {
            invoiceNumber: invoiceNo,
            vendorId: data.vendorId,
            receiptId: receipt.id,
            invoiceDate: passedDate,
            dueDate: new Date(passedDate.getTime() + (30 * 24 * 60 * 60 * 1000)), // Default +30 hari
            totalAmount,
            paidAmount: data.isDirectPay ? totalAmount : 0,
            status: data.isDirectPay ? 'PAID' : 'UNPAID',
            createdBy: 'SYSTEM'
          }
        });

        // 4. Direct Pay Execution
        if (data.isDirectPay && data.paymentMethod) {
          const paymentNo = `PAY-${invoiceNo}`;
          const payment = await tx.apPayment.create({
            data: {
              paymentNumber: paymentNo,
              invoiceId: invoice.id,
              paymentDate: passedDate,
              amount: totalAmount,
              paymentMethod: data.paymentMethod,
              createdBy: 'SYSTEM'
            }
          });

          // Fetch COA Mapping for Payment Method from s_lov_value
          const coaLov = await tx.lovValue.findUnique({
            where: { code_codeValue: { code: 'PAYMENT_METHOD', codeValue: data.paymentMethod } }
          });
          const paymentCoa = coaLov?.description || '111-10'; // Default to Kas Laci (dummy)

          const journal = await tx.postedJournal.create({
            data: {
              journalNumber: `JRN-${paymentNo}-${Math.floor(Math.random() * 1000)}`,
              journalDate: passedDate,
              description: `Penerimaan & Pembayaran Langsung Vendor AP #${invoice.invoiceNumber}`,
              postingType: 'AUTO',
              transType: 'AP_DIRECT_PAY',
              refId: payment.id,
              userId: 1, // System User
              status: 'POSTED',
              createdBy: 'SYSTEM',
              details: {
                create: [
                  { accountCode: '114-10', debit: totalAmount, credit: 0, description: 'Persediaan Barang' }, // Dummy Persediaan
                  { accountCode: paymentCoa, debit: 0, credit: totalAmount, description: `Pembayaran AP Vendor - ${data.paymentMethod}` }
                ]
              }
            }
          });

          await tx.apPayment.update({
            where: { id: payment.id },
            data: { journalId: journal.id }
          });
          
          await tx.apInvoice.update({
            where: { id: invoice.id },
            data: { journalId: journal.id }
          });
        }
      }

      return tx.goodsReceipt.findUnique({
        where: { id: receipt.id },
        include: { items: { include: { inventoryItem: true } }, vendor: true, warehouse: true }
      });
    });
  }

  async findAll() {
    return this.prisma.goodsReceipt.findMany({
      include: { 
        items: { include: { inventoryItem: true } }, 
        vendor: true, 
        warehouse: true,
        invoice: { include: { payments: true } } 
      },
      orderBy: { receiptDate: 'desc' }
    });
  }

  async removeReceipt(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const receipt = await tx.goodsReceipt.findUnique({
        where: { id },
        include: { invoice: true, items: true }
      });
      if (!receipt) throw new NotFoundException('Receipt not found');

      const invoice = receipt.invoice;
      if (invoice && Number(invoice.paidAmount) > 0) {
        throw new BadRequestException('Batal/Hapus ditolak: Tagihan AP ini sudah memiliki riwayat pembayaran (PAID/PARTIAL).');
      }

      // Closing Date Validation
      const closingDateLov = await tx.lovValue.findUnique({
        where: { code_codeValue: { code: 'ACCOUNTING_SETTING', codeValue: 'CLOSING_DATE' } }
      });
      if (closingDateLov?.description) {
        const closingDate = new Date(closingDateLov.description);
        if (new Date(receipt.receiptDate) <= closingDate) {
          throw new BadRequestException(`Batal/Hapus ditolak: Tanggal transaksi ini sudah dikunci oleh Tutup Buku (${closingDateLov.description}).`);
        }
      }

      // Revert Stocks
      for (const old of receipt.items) {
        const inv = await tx.inventoryItem.findUnique({ where: { id: old.inventoryItemId }});
        if (inv) await tx.inventoryItem.update({ where: { id: inv.id }, data: { stockQty: Number(inv.stockQty) - Number(old.quantity) } });
        
        if (receipt.warehouseId != null) {
          const wStock = await tx.warehouseStock.findUnique({
            where: { warehouseId_inventoryItemId: { warehouseId: receipt.warehouseId, inventoryItemId: old.inventoryItemId } }
          });
          if (wStock) await tx.warehouseStock.update({ where: { id: wStock.id }, data: { quantity: Number(wStock.quantity) - Number(old.quantity) } });
        }
      }

      if (invoice) {
        await tx.apInvoice.delete({ where: { id: invoice.id } }); 
      }
      await tx.goodsReceiptItem.deleteMany({ where: { receiptId: id } });
      await tx.goodsReceipt.delete({ where: { id } });
      
      return { success: true, message: 'Receipt berhasil dihapus.' };
    });
  }

  async updateReceipt(id: number, data: any) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.goodsReceipt.findUnique({
        where: { id },
        include: { items: true, invoice: true }
      });
      if (!existing) throw new NotFoundException('Receipt not found');

      const invoice = existing.invoice;
      if (invoice && Number(invoice.paidAmount) > 0) {
        throw new BadRequestException('Gagal Edit: Receipt ini sudah memotong jurnal & pembayaran AP aktif.');
      }

      // Closing Date Validation (Check both old date and new date)
      const closingDateLov = await tx.lovValue.findUnique({
        where: { code_codeValue: { code: 'ACCOUNTING_SETTING', codeValue: 'CLOSING_DATE' } }
      });
      if (closingDateLov?.description) {
        const closingDate = new Date(closingDateLov.description);
        if (new Date(existing.receiptDate) <= closingDate) {
          throw new BadRequestException(`Gagal Edit: Transaksi lama sudah dikunci oleh Tutup Buku (${closingDateLov.description}).`);
        }
        if (data.receiptDate && new Date(data.receiptDate) <= closingDate) {
          throw new BadRequestException(`Gagal Edit: Tanggal baru yang diinput berada pada periode Tutup Buku (${closingDateLov.description}).`);
        }
      }

      // 1. Revert Old Stocks
      for (const old of existing.items) {
        const inv = await tx.inventoryItem.findUnique({ where: { id: old.inventoryItemId } });
        if (inv) await tx.inventoryItem.update({ where: { id: inv.id }, data: { stockQty: Number(inv.stockQty) - Number(old.quantity) } });
        if (existing.warehouseId != null) {
          const wStock = await tx.warehouseStock.findUnique({ where: { warehouseId_inventoryItemId: { warehouseId: existing.warehouseId, inventoryItemId: old.inventoryItemId } } });
          if (wStock) await tx.warehouseStock.update({ where: { id: wStock.id }, data: { quantity: Number(wStock.quantity) - Number(old.quantity) } });
        }
      }

      // 2. Clear old items
      await tx.goodsReceiptItem.deleteMany({ where: { receiptId: id } });

      // 3. Calc new total
      let totalAmount = 0;
      data.items.forEach((i: any) => totalAmount += (i.quantity * i.unitPrice));

      // 4. Apply new items
      const updatedReceipt = await tx.goodsReceipt.update({
        where: { id },
        data: {
          referenceNo: data.referenceNo,
          warehouseId: data.warehouseId,
          vendorId: data.vendorId,
          totalAmount,
          items: {
             create: data.items.map((item: any) => ({
               inventoryItemId: item.inventoryItemId,
               quantity: item.quantity,
               unitPrice: item.unitPrice,
               totalPrice: item.quantity * item.unitPrice
             }))
          }
        }
      });

      // 5. Apply new Stock (Wait without changing averageCost to avoid recursion bugs)
      for (const item of data.items) {
        const inv = await tx.inventoryItem.findUnique({ where: { id: item.inventoryItemId } });
        if (inv) await tx.inventoryItem.update({ where: { id: inv.id }, data: { stockQty: Number(inv.stockQty) + item.quantity } });
        
        let wStock = await tx.warehouseStock.findUnique({ where: { warehouseId_inventoryItemId: { warehouseId: data.warehouseId, inventoryItemId: item.inventoryItemId } } });
        if (wStock) {
          await tx.warehouseStock.update({ where: { id: wStock.id }, data: { quantity: Number(wStock.quantity) + item.quantity } });
        } else {
          await tx.warehouseStock.create({ data: { warehouseId: data.warehouseId, inventoryItemId: item.inventoryItemId, quantity: item.quantity } });
        }
      }

      // 6. Update AP Invoice
      if (invoice) {
        await tx.apInvoice.update({
           where: { id: invoice.id },
           data: { totalAmount, vendorId: data.vendorId }
        });
      }

      return tx.goodsReceipt.findUnique({
        where: { id: updatedReceipt.id },
        include: { items: { include: { inventoryItem: true } }, vendor: true, warehouse: true }
      });
    });
  }
}
