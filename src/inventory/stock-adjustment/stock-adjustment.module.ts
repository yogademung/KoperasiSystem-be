import { Module } from '@nestjs/common';
import { StockAdjustmentController } from './stock-adjustment.controller';
import { StockAdjustmentService } from './stock-adjustment.service';
import { PrismaModule } from 'src/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StockAdjustmentController],
  providers: [StockAdjustmentService]
})
export class StockAdjustmentModule {}
