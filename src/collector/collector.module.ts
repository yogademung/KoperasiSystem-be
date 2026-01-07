import { Module } from '@nestjs/common';
import { CollectorService } from './collector.service';
import { CollectorController } from './collector.controller';
import { PrismaService } from '../database/prisma.service';
import { AccountingModule } from '../accounting/accounting.module';

@Module({
    imports: [AccountingModule],
    controllers: [CollectorController],
    providers: [CollectorService, PrismaService],
    exports: [CollectorService]
})
export class CollectorModule { }
