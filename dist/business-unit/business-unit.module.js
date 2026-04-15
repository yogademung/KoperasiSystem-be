"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessUnitModule = void 0;
const common_1 = require("@nestjs/common");
const business_unit_service_1 = require("./business-unit.service");
const business_unit_controller_1 = require("./business-unit.controller");
const prisma_module_1 = require("../database/prisma.module");
let BusinessUnitModule = class BusinessUnitModule {
};
exports.BusinessUnitModule = BusinessUnitModule;
exports.BusinessUnitModule = BusinessUnitModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        providers: [business_unit_service_1.BusinessUnitService],
        controllers: [business_unit_controller_1.BusinessUnitController],
        exports: [business_unit_service_1.BusinessUnitService],
    })
], BusinessUnitModule);
//# sourceMappingURL=business-unit.module.js.map