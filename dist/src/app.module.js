"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const serve_static_1 = require("@nestjs/serve-static");
const event_emitter_1 = require("@nestjs/event-emitter");
const path_1 = require("path");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./database/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const nasabah_module_1 = require("./nasabah/nasabah.module");
const kredit_module_1 = require("./kredit/kredit.module");
const simpanan_module_1 = require("./simpanan/simpanan.module");
const akuntansi_module_1 = require("./akuntansi/akuntansi.module");
const laporan_module_1 = require("./laporan/laporan.module");
const accounting_module_1 = require("./accounting/accounting.module");
const asset_module_1 = require("./accounting/asset/asset.module");
const capital_module_1 = require("./capital/capital.module");
const reports_module_1 = require("./reports/reports.module");
const settings_module_1 = require("./settings/settings.module");
const period_lock_service_1 = require("./month-end/period-lock.service");
const balance_sheet_service_1 = require("./month-end/balance-sheet.service");
const depreciation_service_1 = require("./month-end/depreciation.service");
const lov_value_service_1 = require("./month-end/lov-value.service");
const month_end_controller_1 = require("./month-end/month-end.controller");
const migration_module_1 = require("./migration/migration.module");
const menu_module_1 = require("./menu/menu.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(process.cwd(), 'uploads'),
                serveRoot: '/uploads',
            }),
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            schedule_1.ScheduleModule.forRoot(),
            event_emitter_1.EventEmitterModule.forRoot({ global: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            nasabah_module_1.NasabahModule,
            kredit_module_1.KreditModule,
            simpanan_module_1.SimpananModule,
            akuntansi_module_1.AkuntansiModule,
            laporan_module_1.LaporanModule,
            accounting_module_1.AccountingModule,
            asset_module_1.AssetModule,
            capital_module_1.CapitalModule,
            reports_module_1.ReportsModule,
            settings_module_1.SettingsModule,
            migration_module_1.MigrationModule,
            menu_module_1.MenuModule,
        ],
        controllers: [app_controller_1.AppController, month_end_controller_1.MonthEndController],
        providers: [app_service_1.AppService, period_lock_service_1.PeriodLockService, balance_sheet_service_1.BalanceSheetService, depreciation_service_1.DepreciationService, lov_value_service_1.LovValueService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map