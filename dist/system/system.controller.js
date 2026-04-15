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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemController = void 0;
const common_1 = require("@nestjs/common");
const system_date_service_1 = require("./system-date.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let SystemController = class SystemController {
    systemDateService;
    constructor(systemDateService) {
        this.systemDateService = systemDateService;
    }
    async getSystemStatus() {
        return this.systemDateService.getSystemStatus();
    }
    async advanceDate() {
        return this.systemDateService.advanceBusinessDate();
    }
};
exports.SystemController = SystemController;
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "getSystemStatus", null);
__decorate([
    (0, common_1.Post)('advance-date'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "advanceDate", null);
exports.SystemController = SystemController = __decorate([
    (0, common_1.Controller)('api/system'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [system_date_service_1.SystemDateService])
], SystemController);
//# sourceMappingURL=system.controller.js.map