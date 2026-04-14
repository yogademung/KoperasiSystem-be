import { Module } from '@nestjs/common';
import { PosShiftController } from './pos-shift.controller';
import { PosShiftService } from './pos-shift.service';
import { AccountingModule } from 'src/accounting/accounting.module';

@Module({
  imports: [AccountingModule],
  controllers: [PosShiftController],
  providers: [PosShiftService]
})
export class PosShiftModule {}
