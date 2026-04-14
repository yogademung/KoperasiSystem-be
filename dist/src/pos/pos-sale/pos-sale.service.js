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
exports.PosSaleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let PosSaleService = class PosSaleService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDrafts(shiftId) {
        return this.prisma.posSale.findMany({
            where: { shiftId, status: 'DRAFT' },
            include: { items: { include: { posProduct: true } } }
        });
    }
    async saveDraft(data) {
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
            const receiptNumber = `POS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${currentCounter.toString().padStart(4, '0')}`;
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
    async checkout(data) {
        return this.prisma.$transaction(async (tx) => {
            const autoDeductSetting = await tx.lovValue.findUnique({
                where: { code_codeValue: { code: 'STORE_SETTING', codeValue: 'AUTO_DEDUCT_STOCK' } }
            });
            const autoDeduct = autoDeductSetting?.description === '1';
            const counterSetting = await tx.lovValue.findUnique({
                where: { code_codeValue: { code: 'STORE_SETTING', codeValue: 'POS_BILL_COUNTER' } }
            });
            let currentCounter = parseInt(counterSetting?.description || '1');
            const receiptNumber = `POS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${currentCounter.toString().padStart(4, '0')}`;
            if (!data.id) {
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
            const shift = await tx.posShift.findUnique({ where: { id: data.shiftId } });
            if (!shift)
                throw new common_1.BadRequestException(`Shift Kasir dengan ID ${data.shiftId} tidak ditemukan atau belum dibuka.`);
            let subtotalAmount = 0;
            for (const item of data.items) {
                const product = await tx.posProduct.findUnique({
                    where: { id: item.posProductId },
                    include: { recipes: { include: { inventoryItem: true } } }
                });
                if (!product)
                    throw new common_1.BadRequestException(`POS Product ${item.posProductId} not found.`);
                const lineTotal = item.quantity * item.unitPrice;
                subtotalAmount += lineTotal;
                if (product.recipes.length > 0) {
                    for (const recipe of product.recipes) {
                        const requiredQty = Number(recipe.quantity) * item.quantity;
                        const currentStock = Number(recipe.inventoryItem.stockQty);
                        if (currentStock < requiredQty) {
                            throw new common_1.BadRequestException(`Stock tidak mencukupi untuk bahan: ${recipe.inventoryItem.name}. Butuh: ${requiredQty}, Sisa: ${currentStock}`);
                        }
                        if (autoDeduct) {
                            await tx.inventoryItem.update({
                                where: { id: recipe.inventoryItemId },
                                data: { stockQty: { decrement: requiredQty } }
                            });
                            if (shift?.warehouseId) {
                                await tx.warehouseStock.upsert({
                                    where: {
                                        warehouseId_inventoryItemId: {
                                            warehouseId: shift.warehouseId,
                                            inventoryItemId: recipe.inventoryItemId
                                        }
                                    },
                                    update: { quantity: { decrement: requiredQty } },
                                    create: {
                                        warehouseId: shift.warehouseId,
                                        inventoryItemId: recipe.inventoryItemId,
                                        quantity: -requiredQty
                                    }
                                });
                            }
                        }
                    }
                }
            }
            const discountAmount = data.discountAmount ?? 0;
            const totalAmount = Math.max(0, subtotalAmount - discountAmount);
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
};
exports.PosSaleService = PosSaleService;
exports.PosSaleService = PosSaleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PosSaleService);
//# sourceMappingURL=pos-sale.service.js.map