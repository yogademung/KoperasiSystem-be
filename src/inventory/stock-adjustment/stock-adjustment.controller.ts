import { Controller, Get, Post, Body } from '@nestjs/common';
import { StockAdjustmentService } from './stock-adjustment.service';

@Controller('inventory/stock-adjustment')
export class StockAdjustmentController {
  constructor(private readonly service: StockAdjustmentService) {}

  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post('bulk')
  createBulk(@Body() data: any) {
    return this.service.createBulkOpname(data);
  }
}
