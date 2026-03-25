import { Controller, Post, Body } from '@nestjs/common';
import { PosSaleService } from './pos-sale.service';

@Controller('pos/sales')
export class PosSaleController {
  constructor(private readonly posSaleService: PosSaleService) {}

  @Post('checkout')
  checkout(@Body() data: {
    shiftId: number;
    paymentMethod: string;
    paymentAmount: number;
    items: { posProductId: number; quantity: number; unitPrice: number; cogsPrice: number }[];
  }) {
    return this.posSaleService.checkout(data);
  }
}
