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
exports.PosProductService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let PosProductService = class PosProductService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const { recipes, ...productData } = data;
        return this.prisma.posProduct.create({
            data: {
                ...productData,
                cogs: productData.cogs || 0,
                recipes: recipes ? {
                    create: recipes.map(r => ({
                        inventoryItemId: r.inventoryItemId,
                        quantity: r.quantity
                    }))
                } : undefined
            },
            include: { recipes: { include: { inventoryItem: true } }, category: true }
        });
    }
    async findAll() {
        return this.prisma.posProduct.findMany({
            include: {
                category: true,
                recipes: {
                    include: { inventoryItem: { include: { uom: true } } }
                }
            }
        });
    }
    async findOne(id) {
        const item = await this.prisma.posProduct.findUnique({
            where: { id },
            include: {
                category: true,
                recipes: {
                    include: { inventoryItem: { include: { uom: true } } }
                }
            }
        });
        if (!item)
            throw new common_1.NotFoundException('POS Product not found');
        return item;
    }
    async update(id, data) {
        const { recipes, ...updateData } = data;
        const query = {
            where: { id },
            data: { ...updateData },
            include: { category: true }
        };
        if (recipes !== undefined) {
            query.data.recipes = {
                deleteMany: {},
                create: recipes.map(r => ({
                    inventoryItemId: r.inventoryItemId,
                    quantity: r.quantity
                }))
            };
        }
        return this.prisma.posProduct.update(query);
    }
    async remove(id) {
        return this.prisma.posProduct.delete({ where: { id } });
    }
    async calculateCogs(id) {
        const product = await this.prisma.posProduct.findUnique({
            where: { id },
            include: {
                recipes: {
                    include: {
                        inventoryItem: { include: { uom: true } }
                    }
                }
            }
        });
        if (!product)
            throw new common_1.NotFoundException('POS Product not found');
        if (product.recipes.length === 0) {
            return {
                calculatedCogs: 0,
                hasRecipe: false,
                details: [],
                message: 'Produk ini tidak memiliki recipe/BOM, HPP tidak dapat dihitung otomatis.'
            };
        }
        const details = product.recipes.map(r => {
            const avgCost = Number(r.inventoryItem.averageCost ?? 0);
            const qty = Number(r.quantity);
            const subtotal = qty * avgCost;
            return {
                inventoryItemId: r.inventoryItemId,
                name: r.inventoryItem.name,
                sku: r.inventoryItem.sku,
                uom: r.inventoryItem.uom?.name ?? '-',
                quantityRequired: qty,
                averageCost: avgCost,
                subtotal,
                warning: avgCost === 0 ? 'Belum ada harga rata-rata (belum ada penerimaan barang)' : null
            };
        });
        const calculatedCogs = details.reduce((sum, d) => sum + d.subtotal, 0);
        return {
            calculatedCogs,
            hasRecipe: true,
            currentCogs: Number(product.cogs),
            details,
            message: null
        };
    }
    async syncCogs(id) {
        const calc = await this.calculateCogs(id);
        if (!calc.hasRecipe)
            return calc;
        await this.prisma.posProduct.update({
            where: { id },
            data: { cogs: calc.calculatedCogs }
        });
        return { ...calc, synced: true, savedCogs: calc.calculatedCogs };
    }
};
exports.PosProductService = PosProductService;
exports.PosProductService = PosProductService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PosProductService);
//# sourceMappingURL=pos-product.service.js.map