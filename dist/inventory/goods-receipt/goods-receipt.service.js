"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoodsReceiptService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let GoodsReceiptService = class GoodsReceiptService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createReceipt(data) {
        return this.prisma.$transaction(async (tx) => {
            let totalAmount = 0;
            data.items.forEach(i => totalAmount += (i.quantity * i.unitPrice));
            const passedDate = new Date(data.receiptDate);
            const closingDateLov = await tx.lovValue.findUnique({
                where: { code_codeValue: { code: 'ACCOUNTING_SETTING', codeValue: 'CLOSING_DATE' } }
            });
            if (closingDateLov?.description) {
                const closingDate = new Date(closingDateLov.description);
                if (passedDate <= closingDate) {
                    throw new common_1.BadRequestException(`Transaksi ditolak: Tanggal penerimaan berada pada atau sebelum Tanggal Tutup Buku Akuntansi (${closingDateLov.description}).`);
                }
            }
            const dateStr = passedDate.toISOString().slice(0, 10).replace(/-/g, '');
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
            for (const item of data.items) {
                const inventory = await tx.inventoryItem.findUnique({ where: { id: item.inventoryItemId } });
                if (!inventory)
                    throw new common_1.NotFoundException('Inventory Item not found: ' + item.inventoryItemId);
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
                }
                else {
                    await tx.warehouseStock.create({
                        data: {
                            warehouseId: data.warehouseId,
                            inventoryItemId: item.inventoryItemId,
                            quantity: item.quantity
                        }
                    });
                }
            }
            if (data.vendorId) {
                const invoiceNo = `INV-${receiptNumber}`;
                const invoice = await tx.apInvoice.create({
                    data: {
                        invoiceNumber: invoiceNo,
                        vendorId: data.vendorId,
                        receiptId: receipt.id,
                        invoiceDate: passedDate,
                        dueDate: new Date(passedDate.getTime() + (30 * 24 * 60 * 60 * 1000)),
                        totalAmount,
                        paidAmount: data.isDirectPay ? totalAmount : 0,
                        status: data.isDirectPay ? 'PAID' : 'UNPAID',
                        createdBy: 'SYSTEM'
                    }
                });
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
                    const coaLov = await tx.lovValue.findUnique({
                        where: { code_codeValue: { code: 'PAYMENT_METHOD', codeValue: data.paymentMethod } }
                    });
                    const paymentCoa = coaLov?.description || '111-10';
                    const journal = await tx.postedJournal.create({
                        data: {
                            journalNumber: `JRN-${paymentNo}-${Math.floor(Math.random() * 1000)}`,
                            journalDate: passedDate,
                            description: `Penerimaan & Pembayaran Langsung Vendor AP #${invoice.invoiceNumber}`,
                            postingType: 'AUTO',
                            transType: 'AP_DIRECT_PAY',
                            refId: payment.id,
                            userId: 1,
                            status: 'POSTED',
                            createdBy: 'SYSTEM',
                            details: {
                                create: [
                                    { accountCode: '114-10', debit: totalAmount, credit: 0, description: 'Persediaan Barang' },
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
    async removeReceipt(id) {
        return this.prisma.$transaction(async (tx) => {
            const receipt = await tx.goodsReceipt.findUnique({
                where: { id },
                include: { invoice: true, items: true }
            });
            if (!receipt)
                throw new common_1.NotFoundException('Receipt not found');
            const invoice = receipt.invoice;
            if (invoice && Number(invoice.paidAmount) > 0) {
                throw new common_1.BadRequestException('Batal/Hapus ditolak: Tagihan AP ini sudah memiliki riwayat pembayaran (PAID/PARTIAL).');
            }
            const closingDateLov = await tx.lovValue.findUnique({
                where: { code_codeValue: { code: 'ACCOUNTING_SETTING', codeValue: 'CLOSING_DATE' } }
            });
            if (closingDateLov?.description) {
                const closingDate = new Date(closingDateLov.description);
                if (new Date(receipt.receiptDate) <= closingDate) {
                    throw new common_1.BadRequestException(`Batal/Hapus ditolak: Tanggal transaksi ini sudah dikunci oleh Tutup Buku (${closingDateLov.description}).`);
                }
            }
            for (const old of receipt.items) {
                const inv = await tx.inventoryItem.findUnique({ where: { id: old.inventoryItemId } });
                if (inv)
                    await tx.inventoryItem.update({ where: { id: inv.id }, data: { stockQty: Number(inv.stockQty) - Number(old.quantity) } });
                if (receipt.warehouseId != null) {
                    const wStock = await tx.warehouseStock.findUnique({
                        where: { warehouseId_inventoryItemId: { warehouseId: receipt.warehouseId, inventoryItemId: old.inventoryItemId } }
                    });
                    if (wStock)
                        await tx.warehouseStock.update({ where: { id: wStock.id }, data: { quantity: Number(wStock.quantity) - Number(old.quantity) } });
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
    async updateReceipt(id, data) {
        return this.prisma.$transaction(async (tx) => {
            const existing = await tx.goodsReceipt.findUnique({
                where: { id },
                include: { items: true, invoice: true }
            });
            if (!existing)
                throw new common_1.NotFoundException('Receipt not found');
            const invoice = existing.invoice;
            if (invoice && Number(invoice.paidAmount) > 0) {
                throw new common_1.BadRequestException('Gagal Edit: Receipt ini sudah memotong jurnal & pembayaran AP aktif.');
            }
            const closingDateLov = await tx.lovValue.findUnique({
                where: { code_codeValue: { code: 'ACCOUNTING_SETTING', codeValue: 'CLOSING_DATE' } }
            });
            if (closingDateLov?.description) {
                const closingDate = new Date(closingDateLov.description);
                if (new Date(existing.receiptDate) <= closingDate) {
                    throw new common_1.BadRequestException(`Gagal Edit: Transaksi lama sudah dikunci oleh Tutup Buku (${closingDateLov.description}).`);
                }
                if (data.receiptDate && new Date(data.receiptDate) <= closingDate) {
                    throw new common_1.BadRequestException(`Gagal Edit: Tanggal baru yang diinput berada pada periode Tutup Buku (${closingDateLov.description}).`);
                }
            }
            for (const old of existing.items) {
                const inv = await tx.inventoryItem.findUnique({ where: { id: old.inventoryItemId } });
                if (inv)
                    await tx.inventoryItem.update({ where: { id: inv.id }, data: { stockQty: Number(inv.stockQty) - Number(old.quantity) } });
                if (existing.warehouseId != null) {
                    const wStock = await tx.warehouseStock.findUnique({ where: { warehouseId_inventoryItemId: { warehouseId: existing.warehouseId, inventoryItemId: old.inventoryItemId } } });
                    if (wStock)
                        await tx.warehouseStock.update({ where: { id: wStock.id }, data: { quantity: Number(wStock.quantity) - Number(old.quantity) } });
                }
            }
            await tx.goodsReceiptItem.deleteMany({ where: { receiptId: id } });
            let totalAmount = 0;
            data.items.forEach((i) => totalAmount += (i.quantity * i.unitPrice));
            const updatedReceipt = await tx.goodsReceipt.update({
                where: { id },
                data: {
                    referenceNo: data.referenceNo,
                    warehouseId: data.warehouseId,
                    vendorId: data.vendorId,
                    totalAmount,
                    items: {
                        create: data.items.map((item) => ({
                            inventoryItemId: item.inventoryItemId,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            totalPrice: item.quantity * item.unitPrice
                        }))
                    }
                }
            });
            for (const item of data.items) {
                const inv = await tx.inventoryItem.findUnique({ where: { id: item.inventoryItemId } });
                if (inv)
                    await tx.inventoryItem.update({ where: { id: inv.id }, data: { stockQty: Number(inv.stockQty) + item.quantity } });
                let wStock = await tx.warehouseStock.findUnique({ where: { warehouseId_inventoryItemId: { warehouseId: data.warehouseId, inventoryItemId: item.inventoryItemId } } });
                if (wStock) {
                    await tx.warehouseStock.update({ where: { id: wStock.id }, data: { quantity: Number(wStock.quantity) + item.quantity } });
                }
                else {
                    await tx.warehouseStock.create({ data: { warehouseId: data.warehouseId, inventoryItemId: item.inventoryItemId, quantity: item.quantity } });
                }
            }
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
};
exports.GoodsReceiptService = GoodsReceiptService;
exports.GoodsReceiptService = GoodsReceiptService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GoodsReceiptService);
//# sourceMappingURL=goods-receipt.service.js.map