import { Module } from '@nestjs/common';
import { SystemDateService } from './system-date.service';
import { SystemSchedulerService } from './system.scheduler';
import { SystemController } from './system.controller';
import { PrismaService } from '../database/prisma.service';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [SystemController],
  providers: [SystemDateService, SystemSchedulerService],
  exports: [SystemDateService, AuditModule],
})
export class SystemModule { }
