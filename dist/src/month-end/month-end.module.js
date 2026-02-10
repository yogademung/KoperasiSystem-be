"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonthEndModule = void 0;
const common_1 = require("@nestjs/common");
const month_end_controller_1 = require("./month-end.controller");
const period_lock_service_1 = require("./period-lock.service");
const balance_sheet_service_1 = require("./balance-sheet.service");
const depreciation_service_1 = require("./depreciation.service");
const lov_value_service_1 = require("./lov-value.service");
const prisma_module_1 = require("../database/prisma.module");
let MonthEndModule = class MonthEndModule {
};
exports.MonthEndModule = MonthEndModule;
exports.MonthEndModule = MonthEndModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [month_end_controller_1.MonthEndController],
        providers: [
            period_lock_service_1.PeriodLockService,
            balance_sheet_service_1.BalanceSheetService,
            depreciation_service_1.DepreciationService,
            lov_value_service_1.LovValueService,
        ],
        exports: [
            period_lock_service_1.PeriodLockService,
            balance_sheet_service_1.BalanceSheetService,
        ],
    })
], MonthEndModule);
//# sourceMappingURL=month-end.module.js.map