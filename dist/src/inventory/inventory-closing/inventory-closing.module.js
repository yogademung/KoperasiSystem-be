"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryClosingModule = void 0;
const common_1 = require("@nestjs/common");
const inventory_closing_service_1 = require("./inventory-closing.service");
const inventory_closing_controller_1 = require("./inventory-closing.controller");
const prisma_module_1 = require("../../database/prisma.module");
let InventoryClosingModule = class InventoryClosingModule {
};
exports.InventoryClosingModule = InventoryClosingModule;
exports.InventoryClosingModule = InventoryClosingModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [inventory_closing_controller_1.InventoryClosingController],
        providers: [inventory_closing_service_1.InventoryClosingService],
        exports: [inventory_closing_service_1.InventoryClosingService],
    })
], InventoryClosingModule);
//# sourceMappingURL=inventory-closing.module.js.map