"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MobileAuthModule = void 0;
const common_1 = require("@nestjs/common");
const mobile_auth_service_1 = require("./mobile-auth.service");
const mobile_auth_controller_1 = require("./mobile-auth.controller");
const prisma_module_1 = require("../database/prisma.module");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const mobile_jwt_strategy_1 = require("./strategies/mobile-jwt.strategy");
let MobileAuthModule = class MobileAuthModule {
};
exports.MobileAuthModule = MobileAuthModule;
exports.MobileAuthModule = MobileAuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            passport_1.PassportModule,
            jwt_1.JwtModule.registerAsync({
                useFactory: () => ({
                    secret: process.env.JWT_SECRET || 'secret',
                    signOptions: {
                        expiresIn: '7d',
                    },
                }),
            }),
        ],
        controllers: [mobile_auth_controller_1.MobileAuthController],
        providers: [mobile_auth_service_1.MobileAuthService, mobile_jwt_strategy_1.MobileJwtStrategy],
        exports: [mobile_auth_service_1.MobileAuthService],
    })
], MobileAuthModule);
//# sourceMappingURL=mobile-auth.module.js.map