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
exports.StockTransferService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let StockTransferService = class StockTransferService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createTransfer(data) {
        if (data.fromWarehouseId === data.toWarehouseId) {
            throw new common_1.BadRequestException('Gudang asal dan tujuan tidak boleh sama');
        }
        return this.prisma.$transaction(async (tx) => {
            const passedDate = new Date(data.transferDate);
            const dateStr = passedDate.toISOString().slice(0, 10).replace(/-/g, '');
            const closingDateLov = await tx.lovValue.findUnique({
                where: { code_codeValue: { code: 'ACCOUNTING_SETTING', codeValue: 'CLOSING_DATE' } },
            });
            if (closingDateLov?.description) {
                const closingDate = new Date(closingDateLov.description);
                if (passedDate <= closingDate) {
                    throw new common_1.BadRequestException(`Transfer ditolak: Tanggal transaksi dikunci periode tutup buku (${closingDateLov.description}).`);
                }
            }
            const results = [];
            for (const item of data.items) {
                if (!item.quantity || item.quantity <= 0)
                    continue;
                const inv = await tx.inventoryItem.findUnique({ where: { id: item.inventoryItemId } });
                if (!inv)
                    continue;
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
                    throw new common_1.BadRequestException(`Stok tidak cukup untuk item "${inv.name}" (${inv.sku}). Tersedia: ${fromQty}, diminta: ${item.quantity}`);
                }
                await tx.warehouseStock.update({
                    where: { id: fromStock.id },
                    data: { quantity: { decrement: item.quantity } },
                });
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
                }
                else {
                    await tx.warehouseStock.create({
                        data: {
                            warehouseId: data.toWarehouseId,
                            inventoryItemId: item.inventoryItemId,
                            quantity: item.quantity,
                        },
                    });
                }
                const seq = Math.floor(Math.random() * 9000) + 1000;
                const transferNumber = `TRF-${dateStr}-${seq}`;
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
};
exports.StockTransferService = StockTransferService;
exports.StockTransferService = StockTransferService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StockTransferService);
//# sourceMappingURL=stock-transfer.service.js.map