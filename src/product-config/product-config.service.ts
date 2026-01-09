import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductConfigService {
    constructor(private prisma: PrismaService) { }

    /**
     * Get all products (for admin settings page)
     */
    async getAllProducts() {
        return this.prisma.productConfig.findMany({
            orderBy: { displayOrder: 'asc' },
        });
    }

    /**
     * Get only enabled products (for sidebar menu)
     */
    async getEnabledProducts() {
        return this.prisma.productConfig.findMany({
            where: { isEnabled: true },
            orderBy: { displayOrder: 'asc' },
        });
    }

    /**
     * Get single product by code
     */
    async getProductByCode(code: string) {
        const product = await this.prisma.productConfig.findUnique({
            where: { productCode: code },
        });

        if (!product) {
            throw new NotFoundException(`Product ${code} not found`);
        }

        return product;
    }

    /**
     * Toggle product enabled/disabled status
     * Core products cannot be disabled
     */
    async toggleProduct(code: string) {
        const product = await this.getProductByCode(code);

        if (product.isCore && product.isEnabled) {
            throw new BadRequestException(
                'Core product cannot be disabled. ANGGOTA is mandatory for cooperative operations.',
            );
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

    /**
     * Update product configuration (interest rates, etc)
     */
    async updateProduct(code: string, data: any) {
        const product = await this.getProductByCode(code);

        // Prevent changing core status
        if ('isCore' in data && product.isCore !== data.isCore) {
            throw new BadRequestException('Cannot change core product status');
        }

        // Validate interest rate range
        if (data.minInterestRate && data.maxInterestRate) {
            const min = Number(data.minInterestRate);
            const max = Number(data.maxInterestRate);
            if (min > max) {
                throw new BadRequestException('Min interest rate cannot exceed max interest rate');
            }
        }

        return this.prisma.productConfig.update({
            where: { productCode: code },
            data,
        });
    }

    /**
     * Reorder products
     */
    async reorderProducts(order: { productCode: string; displayOrder: number }[]) {
        // Use transaction to ensure atomic update
        return this.prisma.$transaction(
            order.map((item) =>
                this.prisma.productConfig.update({
                    where: { productCode: item.productCode },
                    data: { displayOrder: item.displayOrder },
                }),
            ),
        );
    }

    /**
     * Check if a product has existing accounts
     * Useful for warning before disable
     */
    async hasExistingAccounts(code: string): Promise<{ hasAccounts: boolean; count: number }> {
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
        } catch (error) {
            console.error(`Error counting accounts for ${code}:`, error);
        }

        return {
            hasAccounts: count > 0,
            count,
        };
    }
}
