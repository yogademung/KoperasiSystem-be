"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectorModule = void 0;
const common_1 = require("@nestjs/common");
const collector_service_1 = require("./collector.service");
const collector_controller_1 = require("./collector.controller");
const prisma_service_1 = require("../database/prisma.service");
const accounting_module_1 = require("../accounting/accounting.module");
const system_module_1 = require("../system/system.module");
let CollectorModule = class CollectorModule {
};
exports.CollectorModule = CollectorModule;
exports.CollectorModule = CollectorModule = __decorate([
    (0, common_1.Module)({
        imports: [accounting_module_1.AccountingModule, system_module_1.SystemModule],
        controllers: [collector_controller_1.CollectorController],
        providers: [collector_service_1.CollectorService, prisma_service_1.PrismaService],
        exports: [collector_service_1.CollectorService],
    })
], CollectorModule);
//# sourceMappingURL=collector.module.js.map