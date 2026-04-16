import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InventoryItemService } from './inventory-item.service';

@Controller('inventory/items')
export class InventoryItemController {
  constructor(private readonly inventoryItemService: InventoryItemService) {}

  @Post()
  create(@Body() data: { sku: string; name: string; categoryId: number; uomId: number; barcodes?: string[] }) {
    return this.inventoryItemService.create(data);
  }

  @Get()
  findAll() {
    return this.inventoryItemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryItemService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: { name?: string; categoryId?: number; uomId?: number; isActive?: boolean }) {
    return this.inventoryItemService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventoryItemService.remove(+id);
  }

  @Get('scan/:barcode')
  findByBarcode(@Param('barcode') barcode: string) {
    return this.inventoryItemService.findByBarcode(barcode);
  }

  @Post(':id/barcodes')
  addBarcode(@Param('id') id: string, @Body('barcode') barcode: string) {
    return this.inventoryItemService.addBarcode(+id, barcode);
  }

  @Delete('barcodes/:barcodeId')
  removeBarcode(@Param('barcodeId') barcodeId: string) {
    return this.inventoryItemService.removeBarcode(+barcodeId);
  }
}
