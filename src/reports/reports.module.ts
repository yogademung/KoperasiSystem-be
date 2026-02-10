import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { KreditReportController } from './kredit-report.controller';
import { KreditReportService } from './kredit-report.service';
import { PrismaModule } from '../database/prisma.module';
import { AssetModule } from '../accounting/asset/asset.module';
import { AccountingModule } from '../accounting/accounting.module';
import { SettingsModule } from '../settings/settings.module';
import { ProductConfigModule } from '../product-config/product-config.module';

@Module({
  imports: [
    PrismaModule,
    AssetModule,
    AccountingModule,
    SettingsModule,
    ProductConfigModule,
  ],
  controllers: [ReportsController, KreditReportController],
  providers: [ReportsService, KreditReportService],
})
export class ReportsModule {}
