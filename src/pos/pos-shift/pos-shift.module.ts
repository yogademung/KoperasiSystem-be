import { Module } from '@nestjs/common';
import { PosShiftController } from './pos-shift.controller';
import { PosShiftService } from './pos-shift.service';

@Module({
  controllers: [PosShiftController],
  providers: [PosShiftService]
})
export class PosShiftModule {}
