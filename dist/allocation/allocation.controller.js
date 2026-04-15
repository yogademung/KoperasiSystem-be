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
exports.AllocationController = void 0;
const common_1 = require("@nestjs/common");
const allocation_service_1 = require("./allocation.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let AllocationController = class AllocationController {
    allocationService;
    constructor(allocationService) {
        this.allocationService = allocationService;
    }
    async findAllRules() {
        return this.allocationService.findAllRules();
    }
    async createRule(data, req) {
        return this.allocationService.createRule(data, req.user.id);
    }
    async findOneRule(id) {
        return this.allocationService.findOneRule(+id);
    }
    async deleteRule(id) {
        return this.allocationService.deleteRule(+id);
    }
    async preview(body) {
        if (!body.ruleId || !body.year || !body.month)
            throw new common_1.BadRequestException('Missing required fields');
        return this.allocationService.previewAllocation(body.ruleId, body.year, body.month);
    }
    async execute(body, req) {
        if (!body.ruleId || !body.year || !body.month)
            throw new common_1.BadRequestException('Missing required fields');
        return this.allocationService.executeAllocation(body.ruleId, body.year, body.month, req.user.id);
    }
    async getExecutions(year, month) {
        return this.allocationService.getExecutions(year ? +year : undefined, month ? +month : undefined);
    }
    async rollback(id, req) {
        return this.allocationService.rollbackExecution(+id, req.user.id);
    }
};
exports.AllocationController = AllocationController;
__decorate([
    (0, common_1.Get)('rules'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AllocationController.prototype, "findAllRules", null);
__decorate([
    (0, common_1.Post)('rules'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AllocationController.prototype, "createRule", null);
__decorate([
    (0, common_1.Get)('rules/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AllocationController.prototype, "findOneRule", null);
__decorate([
    (0, common_1.Delete)('rules/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AllocationController.prototype, "deleteRule", null);
__decorate([
    (0, common_1.Post)('preview'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AllocationController.prototype, "preview", null);
__decorate([
    (0, common_1.Post)('execute'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AllocationController.prototype, "execute", null);
__decorate([
    (0, common_1.Get)('executions'),
    __param(0, (0, common_1.Query)('year')),
    __param(1, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AllocationController.prototype, "getExecutions", null);
__decorate([
    (0, common_1.Post)('rollback/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AllocationController.prototype, "rollback", null);
exports.AllocationController = AllocationController = __decorate([
    (0, common_1.Controller)('api/allocations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [allocation_service_1.AllocationService])
], AllocationController);
//# sourceMappingURL=allocation.controller.js.map