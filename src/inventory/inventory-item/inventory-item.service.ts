import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class InventoryItemService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; categoryId: number; uomId: number; barcodes?: string[] }) {
    const item = await this.prisma.inventoryItem.create({
      data: {
        name: data.name,
        categoryId: data.categoryId,
        uomId: data.uomId,
        sku: `TMP-${Date.now()}`,
        barcodes: data.barcodes?.length ? {
          create: data.barcodes.map(code => ({ barcode: code }))
        } : undefined
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
        warehouseStocks: { include: { warehouse: true } },
        barcodes: true
      }
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id },
      include: { category: true, uom: true, barcodes: true }
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

  async findByBarcode(barcode: string) {
    let item = await this.prisma.inventoryItem.findFirst({
      where: { barcodes: { some: { barcode } } },
      include: { category: true, uom: true, barcodes: true }
    });

    if (!item) {
      // Fallback search by SKU directly incase barcode is the SKU
      item = await this.prisma.inventoryItem.findUnique({
        where: { sku: barcode },
        include: { category: true, uom: true, barcodes: true }
      });
    }

    if (!item) throw new NotFoundException(`Item with barcode/sku ${barcode} not found`);
    return item;
  }

  async addBarcode(id: number, barcode: string) {
    return this.prisma.itemBarcode.create({
      data: { inventoryItemId: id, barcode }
    });
  }

  async removeBarcode(barcodeId: number) {
    return this.prisma.itemBarcode.delete({ where: { id: barcodeId } });
  }

  async remove(id: number) {
    return this.prisma.inventoryItem.delete({ where: { id } });
  }
}
