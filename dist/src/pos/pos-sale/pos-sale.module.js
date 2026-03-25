"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PosSaleModule = void 0;
const common_1 = require("@nestjs/common");
const pos_sale_controller_1 = require("./pos-sale.controller");
const pos_sale_service_1 = require("./pos-sale.service");
let PosSaleModule = class PosSaleModule {
};
exports.PosSaleModule = PosSaleModule;
exports.PosSaleModule = PosSaleModule = __decorate([
    (0, common_1.Module)({
        controllers: [pos_sale_controller_1.PosSaleController],
        providers: [pos_sale_service_1.PosSaleService]
    })
], PosSaleModule);
//# sourceMappingURL=pos-sale.module.js.map