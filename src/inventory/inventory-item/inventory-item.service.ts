import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class InventoryItemService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; categoryId: number; uomId: number }) {
    const item = await this.prisma.inventoryItem.create({
      data: {
        ...data,
        sku: `TMP-${Date.now()}`
      }
    });

    return this.prisma.inventoryItem.update({
      where: { id: item.id },
      data: { sku: `ITM-${item.id.toString().padStart(5, '0')}` }
    });
  }

  async findAll() {
    return this.prisma.inventoryItem.findMany({
      include: { 
        category: true, 
        uom: true, 
        warehouseStocks: { include: { warehouse: true } }
      }
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id },
      include: { category: true, uom: true }
    });
    if (!item) throw new NotFoundException('Inventory Item not found');
    return item;
  }

  async update(id: number, data: { name?: string; categoryId?: number; uomId?: number; isActive?: boolean }) {
    return this.prisma.inventoryItem.update({
      where: { id },
      data
    });
  }

  async remove(id: number) {
    return this.prisma.inventoryItem.delete({ where: { id } });
  }
}
