"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsModule = void 0;
const common_1 = require("@nestjs/common");
const reports_controller_1 = require("./reports.controller");
const reports_service_1 = require("./reports.service");
const kredit_report_controller_1 = require("./kredit-report.controller");
const kredit_report_service_1 = require("./kredit-report.service");
const prisma_module_1 = require("../database/prisma.module");
const asset_module_1 = require("../accounting/asset/asset.module");
const accounting_module_1 = require("../accounting/accounting.module");
const settings_module_1 = require("../settings/settings.module");
const product_config_module_1 = require("../product-config/product-config.module");
let ReportsModule = class ReportsModule {
};
exports.ReportsModule = ReportsModule;
exports.ReportsModule = ReportsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            asset_module_1.AssetModule,
            accounting_module_1.AccountingModule,
            settings_module_1.SettingsModule,
            product_config_module_1.ProductConfigModule,
        ],
        controllers: [reports_controller_1.ReportsController, kredit_report_controller_1.KreditReportController],
        providers: [reports_service_1.ReportsService, kredit_report_service_1.KreditReportService],
    })
], ReportsModule);
//# sourceMappingURL=reports.module.js.map