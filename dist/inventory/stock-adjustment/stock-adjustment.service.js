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
exports.StockAdjustmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let StockAdjustmentService = class StockAdjustmentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.$transaction(async (tx) => {
            const item = await tx.inventoryItem.findUnique({
                where: { id: data.inventoryItemId }
            });
            if (!item)
                throw new common_1.NotFoundException('Item tidak ditemukan');
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
            const newGlobalQty = Number(item.stockQty) + data.adjustmentQty;
            const newWHQty = Number(wStock.quantity) + data.adjustmentQty;
            await tx.inventoryItem.update({
                where: { id: item.id },
                data: { stockQty: newGlobalQty }
            });
            await tx.warehouseStock.update({
                where: { id: wStock.id },
                data: { quantity: newWHQty }
            });
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
    async createBulkOpname(data) {
        return this.prisma.$transaction(async (tx) => {
            let insertedCount = 0;
            const passedDate = new Date(data.adjustmentDate);
            const dateStr = passedDate.toISOString().slice(0, 10).replace(/-/g, '');
            const closingDateLov = await tx.lovValue.findUnique({
                where: { code_codeValue: { code: 'ACCOUNTING_SETTING', codeValue: 'CLOSING_DATE' } }
            });
            if (closingDateLov?.description) {
                const closingDate = new Date(closingDateLov.description);
                if (passedDate <= closingDate) {
                    throw new common_1.BadRequestException(`Opname ditolak: Tanggal transaksi (${closingDateLov.description}) telah dikunci periode tutup buku.`);
                }
            }
            for (const item of data.items) {
                const inv = await tx.inventoryItem.findUnique({ where: { id: item.inventoryItemId } });
                if (!inv)
                    continue;
                let wStock = await tx.warehouseStock.findUnique({
                    where: { warehouseId_inventoryItemId: { warehouseId: data.warehouseId, inventoryItemId: item.inventoryItemId } }
                });
                const currentWHQty = wStock ? Number(wStock.quantity) : 0;
                const adjustmentQty = item.actualQty - currentWHQty;
                if (adjustmentQty === 0)
                    continue;
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
                    const invCoa = '114-10';
                    const targetCoa = item.accountCode || (adjustmentQty < 0 ? '512-40' : '411-90');
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
};
exports.StockAdjustmentService = StockAdjustmentService;
exports.StockAdjustmentService = StockAdjustmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StockAdjustmentService);
//# sourceMappingURL=stock-adjustment.service.js.map