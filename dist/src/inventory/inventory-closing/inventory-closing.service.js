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
exports.InventoryClosingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const library_1 = require("@prisma/client/runtime/library");
let InventoryClosingService = class InventoryClosingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getClosingHistory(period, warehouseId) {
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
    async runClosing(period, userId) {
        if (!/^\d{4}-\d{2}$/.test(period)) {
            throw new common_1.BadRequestException('Format periode harus YYYY-MM');
        }
        const [year, month] = period.split('-').map(Number);
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        const prevDate = new Date(year, month - 2, 1);
        const prevPeriod = `${prevDate.getFullYear()}-${(prevDate.getMonth() + 1).toString().padStart(2, '0')}`;
        return this.prisma.$transaction(async (tx) => {
            const currentStocks = await tx.warehouseStock.findMany({
                include: { inventoryItem: true }
            });
            const closings = [];
            for (const stock of currentStocks) {
                const prevClosing = await tx.inventoryClosing.findUnique({
                    where: {
                        period_warehouseId_inventoryItemId: {
                            period: prevPeriod,
                            warehouseId: stock.warehouseId,
                            inventoryItemId: stock.inventoryItemId,
                        },
                    },
                });
                const openingStock = prevClosing ? prevClosing.endingStock : new library_1.Decimal(0);
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
                const transferIn = await tx.stockTransfer.aggregate({
                    where: {
                        inventoryItemId: stock.inventoryItemId,
                        toWarehouseId: stock.warehouseId,
                        transferDate: { gte: startDate, lte: endDate },
                        status: 'POSTED',
                    },
                    _sum: { quantity: true },
                });
                const transferOut = await tx.stockTransfer.aggregate({
                    where: {
                        inventoryItemId: stock.inventoryItemId,
                        fromWarehouseId: stock.warehouseId,
                        transferDate: { gte: startDate, lte: endDate },
                        status: 'POSTED',
                    },
                    _sum: { quantity: true },
                });
                const adjustments = await tx.stockAdjustment.aggregate({
                    where: {
                        inventoryItemId: stock.inventoryItemId,
                        warehouseId: stock.warehouseId,
                        adjustmentDate: { gte: startDate, lte: endDate },
                        status: 'POSTED',
                    },
                    _sum: { adjustmentQty: true },
                });
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
                let totalSalesStock = new library_1.Decimal(0);
                for (const sItem of salesItems) {
                    const recipe = sItem.posProduct?.recipes?.[0];
                    if (recipe) {
                        const consumed = new library_1.Decimal(sItem.quantity).mul(new library_1.Decimal(recipe.quantity));
                        totalSalesStock = totalSalesStock.plus(consumed);
                    }
                }
                const receivingQty = receiving._sum.quantity ? new library_1.Decimal(receiving._sum.quantity) : new library_1.Decimal(0);
                const transferInQty = transferIn._sum.quantity ? new library_1.Decimal(transferIn._sum.quantity) : new library_1.Decimal(0);
                const transferOutQty = transferOut._sum.quantity ? new library_1.Decimal(transferOut._sum.quantity) : new library_1.Decimal(0);
                const adjustmentQty = adjustments._sum.adjustmentQty ? new library_1.Decimal(adjustments._sum.adjustmentQty) : new library_1.Decimal(0);
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
};
exports.InventoryClosingService = InventoryClosingService;
exports.InventoryClosingService = InventoryClosingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryClosingService);
//# sourceMappingURL=inventory-closing.service.js.map