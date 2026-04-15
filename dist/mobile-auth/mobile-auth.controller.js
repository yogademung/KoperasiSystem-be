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
exports.MobileAuthController = void 0;
const common_1 = require("@nestjs/common");
const mobile_auth_service_1 = require("./mobile-auth.service");
const mobile_jwt_auth_guard_1 = require("./guards/mobile-jwt-auth.guard");
const login_mobile_dto_1 = require("./dto/login-mobile.dto");
let MobileAuthController = class MobileAuthController {
    mobileAuthService;
    constructor(mobileAuthService) {
        this.mobileAuthService = mobileAuthService;
    }
    login(dto) {
        return this.mobileAuthService.login(dto);
    }
    registerDevice(req, fcmToken) {
        return this.mobileAuthService.registerDevice(req.user.id, fcmToken);
    }
    logout(req) {
        return this.mobileAuthService.logout(req.user.id);
    }
    getProfile(req) {
        return req.user;
    }
};
exports.MobileAuthController = MobileAuthController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_mobile_dto_1.LoginMobileDto]),
    __metadata("design:returntype", void 0)
], MobileAuthController.prototype, "login", null);
__decorate([
    (0, common_1.UseGuards)(mobile_jwt_auth_guard_1.MobileJwtAuthGuard),
    (0, common_1.Post)('register-device'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('fcmToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MobileAuthController.prototype, "registerDevice", null);
__decorate([
    (0, common_1.UseGuards)(mobile_jwt_auth_guard_1.MobileJwtAuthGuard),
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MobileAuthController.prototype, "logout", null);
__decorate([
    (0, common_1.UseGuards)(mobile_jwt_auth_guard_1.MobileJwtAuthGuard),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MobileAuthController.prototype, "getProfile", null);
exports.MobileAuthController = MobileAuthController = __decorate([
    (0, common_1.Controller)('api/mobile/auth'),
    __metadata("design:paramtypes", [mobile_auth_service_1.MobileAuthService])
], MobileAuthController);
//# sourceMappingURL=mobile-auth.controller.js.map