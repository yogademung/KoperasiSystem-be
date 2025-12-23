import { Module, forwardRef } from '@nestjs/common';
import { CapitalService } from './capital.service';
import { CapitalController } from './capital.controller';
import { PrismaService } from '../database/prisma.service';
import { AccountingModule } from '../accounting/accounting.module';

@Module({
    imports: [forwardRef(() => AccountingModule)],
    controllers: [CapitalController],
    providers: [CapitalService],
})
export class CapitalModule { }
