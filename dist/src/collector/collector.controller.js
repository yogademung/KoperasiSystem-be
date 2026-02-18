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
exports.CollectorController = void 0;
const common_1 = require("@nestjs/common");
const collector_service_1 = require("./collector.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const collector_shift_dto_1 = require("./dto/collector-shift.dto");
const common_2 = require("@nestjs/common");
let CollectorController = class CollectorController {
    collectorService;
    constructor(collectorService) {
        this.collectorService = collectorService;
    }
    async getStats(req) {
        const userId = req.user.id;
        const activeShift = await this.collectorService.getActiveShift(userId);
        const shiftStartTime = activeShift?.startTime;
        return this.collectorService.getDailyStats(userId, shiftStartTime);
    }
    async getActiveShift(req) {
        const userId = req.user.id;
        return this.collectorService.getActiveShift(userId);
    }
    async startShift(req, dto) {
        const userId = req.user.id;
        return this.collectorService.startShift(userId, dto);
    }
    async endShift(req, dto) {
        const userId = req.user.id;
        return this.collectorService.endShift(userId, dto);
    }
    async getMyTransactions(req) {
        const userId = req.user.id;
        const activeShift = await this.collectorService.getActiveShift(userId);
        const shiftStartTime = activeShift?.startTime;
        return this.collectorService.getMyTransactions(userId, shiftStartTime);
    }
    async getFlashSummary() {
        return this.collectorService.getFlashSummary();
    }
};
exports.CollectorController = CollectorController;
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CollectorController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('shift/active'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CollectorController.prototype, "getActiveShift", null);
__decorate([
    (0, common_2.Post)('shift/start'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, collector_shift_dto_1.StartShiftDto]),
    __metadata("design:returntype", Promise)
], CollectorController.prototype, "startShift", null);
__decorate([
    (0, common_2.Post)('shift/end'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, collector_shift_dto_1.EndShiftDto]),
    __metadata("design:returntype", Promise)
], CollectorController.prototype, "endShift", null);
__decorate([
    (0, common_1.Get)('my-transactions'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CollectorController.prototype, "getMyTransactions", null);
__decorate([
    (0, common_1.Get)('flash-summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CollectorController.prototype, "getFlashSummary", null);
exports.CollectorController = CollectorController = __decorate([
    (0, common_1.Controller)('api/collector'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [collector_service_1.CollectorService])
], CollectorController);
//# sourceMappingURL=collector.controller.js.map