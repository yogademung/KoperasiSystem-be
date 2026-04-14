import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class PosProductService {
  constructor(private prisma: PrismaService) {}

  async create(data: { 
    code: string; 
    name: string; 
    categoryId: number; 
    sellingPrice: number; 
    cogs?: number;
    recipes?: { inventoryItemId: number; quantity: number }[]
  }) {
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

  async findOne(id: number) {
    const item = await this.prisma.posProduct.findUnique({
      where: { id },
      include: { 
        category: true,
        recipes: {
          include: { inventoryItem: { include: { uom: true } } }
        }
      }
    });
    if (!item) throw new NotFoundException('POS Product not found');
    return item;
  }

  async update(id: number, data: { isActive?: boolean; sellingPrice?: number; cogs?: number; name?: string; code?: string; categoryId?: number; recipes?: { inventoryItemId: number; quantity: number }[] }) {
    const { recipes, ...updateData } = data;
    
    // Base query update
    const query: any = {
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

  async remove(id: number) {
    return this.prisma.posProduct.delete({ where: { id } });
  }

  /**
   * Kalkulasi HPP dari recipe (tanpa simpan)
   * Menghitung Σ(quantity_required × averageCost) untuk setiap bahan dalam recipe
   */
  async calculateCogs(id: number) {
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
    if (!product) throw new NotFoundException('POS Product not found');

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

  /**
   * Kalkulasi HPP dari recipe dan langsung simpan ke cogs
   */
  async syncCogs(id: number) {
    const calc = await this.calculateCogs(id);
    if (!calc.hasRecipe) return calc;

    await this.prisma.posProduct.update({
      where: { id },
      data: { cogs: calc.calculatedCogs }
    });

    return { ...calc, synced: true, savedCogs: calc.calculatedCogs };
  }
}
