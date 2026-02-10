import { Module } from '@nestjs/common';
import { CollectorService } from './collector.service';
import { CollectorController } from './collector.controller';
import { PrismaService } from '../database/prisma.service';
import { AccountingModule } from '../accounting/accounting.module';
import { SystemModule } from '../system/system.module';

@Module({
  imports: [AccountingModule, SystemModule],
  controllers: [CollectorController],
  providers: [CollectorService, PrismaService],
  exports: [CollectorService],
})
export class CollectorModule {}
