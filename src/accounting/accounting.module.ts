import { Module } from '@nestjs/common';
import { AccountingService } from './accounting.service';
import { AccountingController } from './accounting.controller';
import { PrismaModule } from '../database/prisma.module';
import { SimpananModule } from '../simpanan/simpanan.module';
import { AccountingListener } from './listeners/accounting.listener';
import { MonthEndModule } from '../month-end/month-end.module';
import { ProductConfigModule } from '../product-config/product-config.module';

@Module({
  imports: [PrismaModule, SimpananModule, MonthEndModule, ProductConfigModule],
  providers: [AccountingService, AccountingListener],
  controllers: [AccountingController],
  exports: [AccountingService],
})
export class AccountingModule {}
