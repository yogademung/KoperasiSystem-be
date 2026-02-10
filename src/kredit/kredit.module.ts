import { Module, forwardRef } from '@nestjs/common';
import { KreditService } from './kredit.service';
import { KreditController } from './kredit.controller';
import { PrismaModule } from '../database/prisma.module';
import { AccountingModule } from '../accounting/accounting.module';

@Module({
  imports: [PrismaModule, forwardRef(() => AccountingModule)],
  providers: [KreditService],
  controllers: [KreditController],
  exports: [KreditService],
})
export class KreditModule {}
