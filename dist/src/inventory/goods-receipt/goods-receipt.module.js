"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoodsReceiptModule = void 0;
const common_1 = require("@nestjs/common");
const goods_receipt_controller_1 = require("./goods-receipt.controller");
const goods_receipt_service_1 = require("./goods-receipt.service");
const prisma_module_1 = require("../../database/prisma.module");
let GoodsReceiptModule = class GoodsReceiptModule {
};
exports.GoodsReceiptModule = GoodsReceiptModule;
exports.GoodsReceiptModule = GoodsReceiptModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [goods_receipt_controller_1.GoodsReceiptController],
        providers: [goods_receipt_service_1.GoodsReceiptService]
    })
], GoodsReceiptModule);
//# sourceMappingURL=goods-receipt.module.js.map