import { Module } from '@nestjs/common';
import { PosProductController } from './pos-product.controller';
import { PosProductService } from './pos-product.service';

@Module({
  controllers: [PosProductController],
  providers: [PosProductService]
})
export class PosProductModule {}
