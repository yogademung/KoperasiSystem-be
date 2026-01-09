"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterUnitModule = void 0;
const common_1 = require("@nestjs/common");
const inter_unit_controller_1 = require("./inter-unit.controller");
const inter_unit_service_1 = require("./inter-unit.service");
const prisma_module_1 = require("../database/prisma.module");
const accounting_module_1 = require("../accounting/accounting.module");
let InterUnitModule = class InterUnitModule {
};
exports.InterUnitModule = InterUnitModule;
exports.InterUnitModule = InterUnitModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, accounting_module_1.AccountingModule],
        controllers: [inter_unit_controller_1.InterUnitController],
        providers: [inter_unit_service_1.InterUnitService],
        exports: [inter_unit_service_1.InterUnitService],
    })
], InterUnitModule);
//# sourceMappingURL=inter-unit.module.js.map