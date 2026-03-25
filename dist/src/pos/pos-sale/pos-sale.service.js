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
            await tx.lovValue.update({
                where: { code_codeValue: { code: 'STORE_SETTING', codeValue: 'POS_BILL_COUNTER' } },
                data: { description: (currentCounter + 1).toString() }
            });
            let totalAmount = 0;
            for (const item of data.items) {
                const product = await tx.posProduct.findUnique({
                    where: { id: item.posProductId },
                    include: { recipes: { include: { inventoryItem: true } } }
                });
                if (!product)
                    throw new common_1.BadRequestException(`POS Product ${item.posProductId} not found.`);
                const lineTotal = item.quantity * item.unitPrice;
                totalAmount += lineTotal;
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
                        }
                    }
                }
            }
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
};
exports.PosSaleService = PosSaleService;
exports.PosSaleService = PosSaleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PosSaleService);
//# sourceMappingURL=pos-sale.service.js.map