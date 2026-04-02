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
}
