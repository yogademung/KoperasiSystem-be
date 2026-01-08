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
exports.ProductConfigService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let ProductConfigService = class ProductConfigService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllProducts() {
        return this.prisma.productConfig.findMany({
            orderBy: { displayOrder: 'asc' },
        });
    }
    async getEnabledProducts() {
        return this.prisma.productConfig.findMany({
            where: { isEnabled: true },
            orderBy: { displayOrder: 'asc' },
        });
    }
    async getProductByCode(code) {
        const product = await this.prisma.productConfig.findUnique({
            where: { productCode: code },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product ${code} not found`);
        }
        return product;
    }
    async toggleProduct(code) {
        const product = await this.getProductByCode(code);
        if (product.isCore && product.isEnabled) {
            throw new common_1.BadRequestException('Core product cannot be disabled. ANGGOTA is mandatory for cooperative operations.');
        }
        const updated = await this.prisma.productConfig.update({
            where: { productCode: code },
            data: { isEnabled: !product.isEnabled },
        });
        return {
            ...updated,
            message: updated.isEnabled
                ? `${updated.productName} enabled successfully`
                : `${updated.productName} disabled successfully`,
        };
    }
    async updateProduct(code, data) {
        const product = await this.getProductByCode(code);
        if ('isCore' in data && product.isCore !== data.isCore) {
            throw new common_1.BadRequestException('Cannot change core product status');
        }
        if (data.minInterestRate && data.maxInterestRate) {
            const min = Number(data.minInterestRate);
            const max = Number(data.maxInterestRate);
            if (min > max) {
                throw new common_1.BadRequestException('Min interest rate cannot exceed max interest rate');
            }
        }
        return this.prisma.productConfig.update({
            where: { productCode: code },
            data,
        });
    }
    async reorderProducts(order) {
        return this.prisma.$transaction(order.map((item) => this.prisma.productConfig.update({
            where: { productCode: item.productCode },
            data: { displayOrder: item.displayOrder },
        })));
    }
    async hasExistingAccounts(code) {
        const product = await this.getProductByCode(code);
        let count = 0;
        try {
            switch (code) {
                case 'ANGGOTA':
                    count = await this.prisma.anggotaAccount.count();
                    break;
                case 'TABRELA':
                    count = await this.prisma.nasabahTab.count();
                    break;
                case 'DEPOSITO':
                    count = await this.prisma.nasabahJangka.count();
                    break;
                case 'BRAHMACARI':
                    count = await this.prisma.nasabahBrahmacari.count();
                    break;
                case 'BALIMESARI':
                    count = await this.prisma.nasabahBalimesari.count();
                    break;
                case 'WANAPRASTA':
                    count = await this.prisma.nasabahWanaprasta.count();
                    break;
                default:
                    count = 0;
            }
        }
        catch (error) {
            console.error(`Error counting accounts for ${code}:`, error);
        }
        return {
            hasAccounts: count > 0,
            count,
        };
    }
};
exports.ProductConfigService = ProductConfigService;
exports.ProductConfigService = ProductConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductConfigService);
//# sourceMappingURL=product-config.service.js.map