import { Module, forwardRef } from '@nestjs/common';
import { CollectorService } from './collector.service';
import { CollectorController } from './collector.controller';
import { PrismaModule } from '../database/prisma.module';
import { AccountingModule } from '../accounting/accounting.module';

@Module({
    imports: [PrismaModule, forwardRef(() => AccountingModule)],
    controllers: [CollectorController],
    providers: [CollectorService],
    exports: [CollectorService]
})
export class CollectorModule { }
