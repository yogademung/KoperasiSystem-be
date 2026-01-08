import { Controller, Get, Post, Put, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ProductConfigService } from './product-config.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Prisma } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('api/settings/products')
export class ProductConfigController {
    constructor(private readonly productConfigService: ProductConfigService) { }

    /**
     * GET /api/settings/products
     * Get all products (admin settings page)
     */
    @Get()
    getAllProducts() {
        return this.productConfigService.getAllProducts();
    }

    /**
     * GET /api/settings/products/enabled
     * Get only enabled products (sidebar menu)
     */
    @Get('enabled')
    getEnabledProducts() {
        return this.productConfigService.getEnabledProducts();
    }

    /**
     * GET /api/settings/products/:code
     * Get single product by code
     */
    @Get(':code')
    getProductByCode(@Param('code') code: string) {
        return this.productConfigService.getProductByCode(code);
    }

    /**
     * GET /api/settings/products/:code/accounts
     * Check if product has existing accounts
     */
    @Get(':code/accounts')
    hasExistingAccounts(@Param('code') code: string) {
        return this.productConfigService.hasExistingAccounts(code);
    }

    /**
     * PATCH /api/settings/products/:code/toggle
     * Toggle product enabled/disabled
     */
    @Patch(':code/toggle')
    toggleProduct(@Param('code') code: string) {
        return this.productConfigService.toggleProduct(code);
    }

    /**
     * PUT /api/settings/products/:code
     * Update product configuration
     */
    @Put(':code')
    updateProduct(
        @Param('code') code: string,
        @Body() data: Prisma.ProductConfigUpdateInput,
    ) {
        return this.productConfigService.updateProduct(code, data);
    }

    /**
     * POST /api/settings/products/reorder
     * Reorder products
     */
    @Post('reorder')
    reorderProducts(
        @Body() body: { order: { productCode: string; displayOrder: number }[] },
    ) {
        return this.productConfigService.reorderProducts(body.order);
    }
}
