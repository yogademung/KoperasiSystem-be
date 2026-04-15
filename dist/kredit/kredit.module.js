"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KreditModule = void 0;
const common_1 = require("@nestjs/common");
const kredit_service_1 = require("./kredit.service");
const kredit_controller_1 = require("./kredit.controller");
const prisma_module_1 = require("../database/prisma.module");
const accounting_module_1 = require("../accounting/accounting.module");
let KreditModule = class KreditModule {
};
exports.KreditModule = KreditModule;
exports.KreditModule = KreditModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, (0, common_1.forwardRef)(() => accounting_module_1.AccountingModule)],
        providers: [kredit_service_1.KreditService],
        controllers: [kredit_controller_1.KreditController],
        exports: [kredit_service_1.KreditService],
    })
], KreditModule);
//# sourceMappingURL=kredit.module.js.map