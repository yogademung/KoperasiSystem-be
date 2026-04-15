"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryClosingController = void 0;
const common_1 = require("@nestjs/common");
const inventory_closing_service_1 = require("./inventory-closing.service");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let InventoryClosingController = class InventoryClosingController {
    closingService;
    constructor(closingService) {
        this.closingService = closingService;
    }
    async getHistory(period, warehouseId) {
        return this.closingService.getClosingHistory(period, warehouseId ? parseInt(warehouseId) : undefined);
    }
    async runClosing(period, user) {
        return this.closingService.runClosing(period, user.username);
    }
};
exports.InventoryClosingController = InventoryClosingController;
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Query)('period')),
    __param(1, (0, common_1.Query)('warehouseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InventoryClosingController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Post)('run'),
    (0, roles_decorator_1.Roles)('ADMIN', 'WAREHOUSE_MANAGER'),
    __param(0, (0, common_1.Body)('period')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InventoryClosingController.prototype, "runClosing", null);
exports.InventoryClosingController = InventoryClosingController = __decorate([
    (0, common_1.Controller)('inventory/closing'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [inventory_closing_service_1.InventoryClosingService])
], InventoryClosingController);
//# sourceMappingURL=inventory-closing.controller.js.map