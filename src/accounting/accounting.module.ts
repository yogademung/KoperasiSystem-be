import { Module } from '@nestjs/common';
import { AccountingService } from './accounting.service';
import { AccountingController } from './accounting.controller';
import { PrismaModule } from '../database/prisma.module';
import { AccountingListener } from './listeners/accounting.listener';

@Module({
  imports: [PrismaModule],
  providers: [AccountingService, AccountingListener],
  controllers: [AccountingController]
})
export class AccountingModule { }
