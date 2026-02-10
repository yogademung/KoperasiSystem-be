import { Module } from '@nestjs/common';
import { MonthEndController } from './month-end.controller';
import { PeriodLockService } from './period-lock.service';
import { BalanceSheetService } from './balance-sheet.service';
import { DepreciationService } from './depreciation.service';
import { LovValueService } from './lov-value.service';
import { PrismaModule } from '../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MonthEndController],
  providers: [
    PeriodLockService,
    BalanceSheetService,
    DepreciationService,
    LovValueService,
  ],
  exports: [
    PeriodLockService, // Exported for AccountingService validation
    BalanceSheetService, // Exported for potential future use
  ],
})
export class MonthEndModule {}
