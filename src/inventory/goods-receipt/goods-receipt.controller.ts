import { Controller, Post, Body, Get, Patch, Param, Delete } from '@nestjs/common';
import { GoodsReceiptService } from './goods-receipt.service';

@Controller('inventory/receipts')
export class GoodsReceiptController {
  constructor(private readonly receiptService: GoodsReceiptService) {}

  @Post()
  createReceipt(@Body() data: any) {
    return this.receiptService.createReceipt(data);
  }

  @Get()
  findAll() {
    return this.receiptService.findAll();
  }

  @Patch(':id')
  updateReceipt(@Param('id') id: string, @Body() data: any) {
    return this.receiptService.updateReceipt(Number(id), data);
  }

  @Delete(':id')
  removeReceipt(@Param('id') id: string) {
    return this.receiptService.removeReceipt(Number(id));
  }
}
