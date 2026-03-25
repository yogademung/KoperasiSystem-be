import { Module } from '@nestjs/common';
import { InventoryClosingService } from './inventory-closing.service';
import { InventoryClosingController } from './inventory-closing.controller';
import { PrismaModule } from 'src/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InventoryClosingController],
  providers: [InventoryClosingService],
  exports: [InventoryClosingService],
})
export class InventoryClosingModule {}
