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
exports.BudgetController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const budget_service_1 = require("./budget.service");
let BudgetController = class BudgetController {
    budgetService;
    constructor(budgetService) {
        this.budgetService = budgetService;
    }
    async createPeriod(dto, req) {
        return this.budgetService.createPeriod(dto, req.user.userId);
    }
    async findAllPeriods(query) {
        const filters = {
            year: query.year ? parseInt(query.year) : undefined,
            status: query.status,
        };
        return this.budgetService.findAllPeriods(filters);
    }
    async findOnePeriod(id) {
        return this.budgetService.findOnePeriod(id);
    }
    async updatePeriod(id, dto) {
        return this.budgetService.updatePeriod(id, dto);
    }
    async approvePeriod(id, req) {
        return this.budgetService.approvePeriod(id, req.user.userId);
    }
    async closePeriod(id) {
        return this.budgetService.closePeriod(id);
    }
    async createBudget(dto, req) {
        return this.budgetService.createBudget(dto, req.user.userId);
    }
    async findAllBudgets(query) {
        const filters = {
            periodId: query.periodId ? parseInt(query.periodId) : undefined,
            costCenterId: query.costCenterId
                ? parseInt(query.costCenterId)
                : undefined,
            businessUnitId: query.businessUnitId
                ? parseInt(query.businessUnitId)
                : undefined,
            accountCode: query.accountCode,
            search: query.search,
        };
        return this.budgetService.findAllBudgets(filters);
    }
    async findOneBudget(id) {
        return this.budgetService.findOneBudget(id);
    }
    async updateBudget(id, dto) {
        return this.budgetService.updateBudget(id, dto);
    }
    async deleteBudget(id) {
        return this.budgetService.deleteBudget(id);
    }
    async copyBudgets(body, req) {
        return this.budgetService.copyFromPreviousPeriod(body.sourcePeriodId, body.targetPeriodId, req.user.userId, body.adjustmentPercent || 0);
    }
    async getVarianceReport(periodId, costCenterId, businessUnitId) {
        return this.budgetService.getVarianceReport(periodId, costCenterId ? parseInt(costCenterId) : undefined, businessUnitId ? parseInt(businessUnitId) : undefined);
    }
    async getBudgetUtilization(costCenterId, periodId) {
        return this.budgetService.getBudgetUtilization(costCenterId, periodId);
    }
};
exports.BudgetController = BudgetController;
__decorate([
    (0, common_1.Post)('periods'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BudgetController.prototype, "createPeriod", null);
__decorate([
    (0, common_1.Get)('periods'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BudgetController.prototype, "findAllPeriods", null);
__decorate([
    (0, common_1.Get)('periods/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BudgetController.prototype, "findOnePeriod", null);
__decorate([
    (0, common_1.Put)('periods/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], BudgetController.prototype, "updatePeriod", null);
__decorate([
    (0, common_1.Post)('periods/:id/approve'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], BudgetController.prototype, "approvePeriod", null);
__decorate([
    (0, common_1.Post)('periods/:id/close'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BudgetController.prototype, "closePeriod", null);
__decorate([
    (0, common_1.Post)('entries'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BudgetController.prototype, "createBudget", null);
__decorate([
    (0, common_1.Get)('entries'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BudgetController.prototype, "findAllBudgets", null);
__decorate([
    (0, common_1.Get)('entries/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BudgetController.prototype, "findOneBudget", null);
__decorate([
    (0, common_1.Put)('entries/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], BudgetController.prototype, "updateBudget", null);
__decorate([
    (0, common_1.Delete)('entries/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BudgetController.prototype, "deleteBudget", null);
__decorate([
    (0, common_1.Post)('entries/copy'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BudgetController.prototype, "copyBudgets", null);
__decorate([
    (0, common_1.Get)('variance/:periodId'),
    __param(0, (0, common_1.Param)('periodId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('costCenterId')),
    __param(2, (0, common_1.Query)('businessUnitId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", Promise)
], BudgetController.prototype, "getVarianceReport", null);
__decorate([
    (0, common_1.Get)('utilization/:costCenterId/:periodId'),
    __param(0, (0, common_1.Param)('costCenterId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('periodId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], BudgetController.prototype, "getBudgetUtilization", null);
exports.BudgetController = BudgetController = __decorate([
    (0, common_1.Controller)('api/budget'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [budget_service_1.BudgetService])
], BudgetController);
//# sourceMappingURL=budget.controller.js.map