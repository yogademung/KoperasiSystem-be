import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { NasabahModule } from './nasabah/nasabah.module';
import { KreditModule } from './kredit/kredit.module';
import { SimpananModule } from './simpanan/simpanan.module';
import { AkuntansiModule } from './akuntansi/akuntansi.module';
import { LaporanModule } from './laporan/laporan.module';
import { AccountingModule } from './accounting/accounting.module';
import { AssetModule } from './accounting/asset/asset.module';
import { CapitalModule } from './capital/capital.module';
import { ReportsModule } from './reports/reports.module';
import { SettingsModule } from './settings/settings.module';
import { PeriodLockService } from './month-end/period-lock.service';
import { BalanceSheetService } from './month-end/balance-sheet.service';
import { DepreciationService } from './month-end/depreciation.service';
import { LovValueService } from './month-end/lov-value.service';
import { MonthEndController } from './month-end/month-end.controller';
import { MigrationModule } from './migration/migration.module';
import { MenuModule } from './menu/menu.module';
import { CollectorModule } from './collector/collector.module';
import { SystemModule } from './system/system.module';
import { ProductConfigModule } from './product-config/product-config.module';
import { InterUnitModule } from './inter-unit/inter-unit.module';
import { CostCenterModule } from './cost-center/cost-center.module';
import { BusinessUnitModule } from './business-unit/business-unit.module';




@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot({ global: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    NasabahModule,
    KreditModule,
    SimpananModule,
    AkuntansiModule,
    LaporanModule,
    AccountingModule,
    AssetModule,
    CapitalModule,
    ReportsModule,
    SettingsModule,
    MigrationModule,
    MenuModule,
    CollectorModule,
    SystemModule,
    BusinessUnitModule,
    // TODO: Re-enable after Prisma client regenerated with new models
    ProductConfigModule,
    InterUnitModule, // Phase 13: Inter-Unit Transactions
    CostCenterModule, // Phase 13: Cost Centers

  ],
  controllers: [AppController, MonthEndController],
  providers: [AppService, PeriodLockService, BalanceSheetService, DepreciationService, LovValueService],
})
export class AppModule { }
