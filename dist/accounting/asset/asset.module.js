"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetModule = void 0;
const common_1 = require("@nestjs/common");
const asset_service_1 = require("./asset.service");
const asset_controller_1 = require("./asset.controller");
const accounting_module_1 = require("../accounting.module");
const prisma_module_1 = require("../../database/prisma.module");
const month_end_module_1 = require("../../month-end/month-end.module");
let AssetModule = class AssetModule {
};
exports.AssetModule = AssetModule;
exports.AssetModule = AssetModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, (0, common_1.forwardRef)(() => accounting_module_1.AccountingModule), month_end_module_1.MonthEndModule],
        providers: [asset_service_1.AssetService],
        controllers: [asset_controller_1.AssetController],
        exports: [asset_service_1.AssetService],
    })
], AssetModule);
//# sourceMappingURL=asset.module.js.map