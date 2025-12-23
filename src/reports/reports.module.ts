import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { PrismaModule } from '../database/prisma.module';
import { AssetModule } from '../accounting/asset/asset.module';
import { AccountingModule } from '../accounting/accounting.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
    imports: [PrismaModule, AssetModule, AccountingModule, SettingsModule],
    controllers: [ReportsController],
    providers: [ReportsService],
})
export class ReportsModule { }
