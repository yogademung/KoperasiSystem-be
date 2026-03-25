import { Module } from '@nestjs/common';
import { StockTransferController } from './stock-transfer.controller';
import { StockTransferService } from './stock-transfer.service';
import { PrismaModule } from 'src/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StockTransferController],
  providers: [StockTransferService],
})
export class StockTransferModule {}
