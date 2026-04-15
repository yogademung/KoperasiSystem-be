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
exports.CostCenterController = void 0;
const common_1 = require("@nestjs/common");
const cost_center_service_1 = require("./cost-center.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let CostCenterController = class CostCenterController {
    costCenterService;
    constructor(costCenterService) {
        this.costCenterService = costCenterService;
    }
    async create(dto) {
        const userId = 1;
        return this.costCenterService.create(dto, userId);
    }
    async findAll(filters) {
        return this.costCenterService.findAll(filters);
    }
    async getTree(rootId) {
        return this.costCenterService.getTree(rootId);
    }
    async findOne(id) {
        return this.costCenterService.findOne(id);
    }
    async update(id, dto) {
        return this.costCenterService.update(id, dto);
    }
    async delete(id) {
        return this.costCenterService.delete(id);
    }
    async getChildren(id) {
        return this.costCenterService.getChildren(id);
    }
    async getBudgetStatus(id, year, month) {
        return this.costCenterService.getBudgetStatus(id, year, month);
    }
};
exports.CostCenterController = CostCenterController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CostCenterController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CostCenterController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('tree'),
    __param(0, (0, common_1.Query)('rootId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CostCenterController.prototype, "getTree", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CostCenterController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], CostCenterController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CostCenterController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)(':id/children'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CostCenterController.prototype, "getChildren", null);
__decorate([
    (0, common_1.Get)(':id/budget-status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('year', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('month', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", Promise)
], CostCenterController.prototype, "getBudgetStatus", null);
exports.CostCenterController = CostCenterController = __decorate([
    (0, common_1.Controller)('api/cost-centers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [cost_center_service_1.CostCenterService])
], CostCenterController);
//# sourceMappingURL=cost-center.controller.js.map