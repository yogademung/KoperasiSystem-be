import { Module } from '@nestjs/common';
import { InterUnitController } from './inter-unit.controller';
import { InterUnitService } from './inter-unit.service';
import { PrismaModule } from '../database/prisma.module';
import { AccountingModule } from '../accounting/accounting.module';

@Module({
  imports: [PrismaModule, AccountingModule],
  controllers: [InterUnitController],
  providers: [InterUnitService],
  exports: [InterUnitService],
})
export class InterUnitModule {}
