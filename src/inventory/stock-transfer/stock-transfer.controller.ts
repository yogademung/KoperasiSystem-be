import { Controller, Get, Post, Body } from '@nestjs/common';
import { StockTransferService } from './stock-transfer.service';

@Controller('inventory/stock-transfer')
export class StockTransferController {
  constructor(private readonly service: StockTransferService) {}

  @Post()
  create(@Body() data: any) {
    return this.service.createTransfer(data);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }
}
