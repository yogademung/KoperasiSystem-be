import { Module } from '@nestjs/common';
import { PosSaleController } from './pos-sale.controller';
import { PosSaleService } from './pos-sale.service';

@Module({
  controllers: [PosSaleController],
  providers: [PosSaleService]
})
export class PosSaleModule {}
