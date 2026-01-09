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
exports.InterUnitController = void 0;
const common_1 = require("@nestjs/common");
const inter_unit_service_1 = require("./inter-unit.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let InterUnitController = class InterUnitController {
    interUnitService;
    constructor(interUnitService) {
        this.interUnitService = interUnitService;
    }
    async createTransaction(dto) {
        const userId = 1;
        return this.interUnitService.create(dto, userId);
    }
    async getTransactions(filters) {
        if (filters.startDate) {
            filters.startDate = new Date(filters.startDate);
        }
        if (filters.endDate) {
            filters.endDate = new Date(filters.endDate);
        }
        return this.interUnitService.findAll(filters);
    }
    async getTransaction(id) {
        return this.interUnitService.findOne(id);
    }
    async approveTransaction(id) {
        const userId = 1;
        return this.interUnitService.approve(id, userId);
    }
    async postTransaction(id) {
        const userId = 1;
        return this.interUnitService.post(id, userId);
    }
    async deleteTransaction(id) {
        return this.interUnitService.delete(id);
    }
    async getBalances(unitId, asOfDate) {
        const date = asOfDate ? new Date(asOfDate) : undefined;
        return this.interUnitService.getBalances(unitId, date);
    }
    async generateElimination(year, month) {
        const userId = 1;
        return this.interUnitService.generateElimination(year, month, userId);
    }
};
exports.InterUnitController = InterUnitController;
__decorate([
    (0, common_1.Post)('transactions'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InterUnitController.prototype, "createTransaction", null);
__decorate([
    (0, common_1.Get)('transactions'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InterUnitController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)('transactions/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], InterUnitController.prototype, "getTransaction", null);
__decorate([
    (0, common_1.Post)('transactions/:id/approve'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], InterUnitController.prototype, "approveTransaction", null);
__decorate([
    (0, common_1.Post)('transactions/:id/post'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], InterUnitController.prototype, "postTransaction", null);
__decorate([
    (0, common_1.Delete)('transactions/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], InterUnitController.prototype, "deleteTransaction", null);
__decorate([
    (0, common_1.Get)('balances/:unitId'),
    __param(0, (0, common_1.Param)('unitId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('asOfDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], InterUnitController.prototype, "getBalances", null);
__decorate([
    (0, common_1.Post)('elimination/:year/:month'),
    __param(0, (0, common_1.Param)('year', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('month', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], InterUnitController.prototype, "generateElimination", null);
exports.InterUnitController = InterUnitController = __decorate([
    (0, common_1.Controller)('inter-unit'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [inter_unit_service_1.InterUnitService])
], InterUnitController);
//# sourceMappingURL=inter-unit.controller.js.map