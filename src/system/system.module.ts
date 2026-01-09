import { Module } from '@nestjs/common';
import { SystemDateService } from './system-date.service';
import { SystemSchedulerService } from './system.scheduler';
import { SystemController } from './system.controller';
import { PrismaService } from '../database/prisma.service';

@Module({
    controllers: [SystemController],
    providers: [SystemDateService, PrismaService, SystemSchedulerService],
    exports: [SystemDateService]
})
export class SystemModule { }
