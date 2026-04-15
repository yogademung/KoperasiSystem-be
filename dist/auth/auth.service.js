"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../database/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const otplib_1 = require("otplib");
const qrcode_1 = require("qrcode");
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async login(loginDto) {
        console.log('Login attempt for user:', loginDto.username);
        otplib_1.authenticator.options = { window: 1 };
        const user = await this.prisma.user.findUnique({
            where: { username: loginDto.username },
            include: { role: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.token && !loginDto.forceLogin) {
            return {
                requiresForceLogin: true,
                message: 'Account is already logged in on another device',
            };
        }
        if (user.isTotpEnabled) {
            if (!user.totpSecret) {
                const secret = otplib_1.authenticator.generateSecret();
                const otpauthUrl = otplib_1.authenticator.keyuri(user.username, 'Koperasi System', secret);
                const qrCodeUrl = await (0, qrcode_1.toDataURL)(otpauthUrl);
                return {
                    requiresSetup2FA: true,
                    userId: user.id,
                    qrCodeUrl,
                    secret,
                    message: 'Please setup Two-Factor Authentication',
                };
            }
            if (!loginDto.twoFactorCode) {
                return {
                    requires2FA: true,
                    message: 'Enter 2FA Code',
                };
            }
            const isValid = otplib_1.authenticator.verify({
                token: loginDto.twoFactorCode,
                secret: user.totpSecret,
            });
            if (!isValid) {
                throw new common_1.UnauthorizedException('Invalid 2FA Code');
            }
        }
        const refreshToken = this.jwtService.sign({ sub: user.id }, { expiresIn: '7d' });
        const payload = {
            sub: user.id,
            username: user.username,
            role: user.role?.roleName || null,
            rt_hash: refreshToken.slice(-10),
        };
        const accessToken = this.jwtService.sign(payload);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { token: refreshToken },
        });
        const menuRoles = user.roleId
            ? await this.prisma.menuRole.findMany({
                where: {
                    roleId: user.roleId,
                    canRead: true,
                    menu: { isActive: true },
                },
                include: {
                    menu: true,
                },
                orderBy: {
                    menu: { orderNum: 'asc' },
                },
            })
            : [];
        const menus = this.buildMenuTree(menuRoles);
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                role: user.role?.roleName || null,
                menus: menus,
            },
        };
    }
    async confirmTotpSetup(userId, secret, code) {
        const isValid = otplib_1.authenticator.verify({
            token: code,
            secret: secret,
        });
        if (!isValid)
            throw new common_1.UnauthorizedException('Invalid Code');
        await this.prisma.user.update({
            where: { id: userId },
            data: { totpSecret: secret },
        });
        return { success: true };
    }
    buildMenuTree(menuRoles) {
        const menuMap = new Map();
        const rootMenus = [];
        menuRoles.forEach((mr) => {
            const menu = {
                id: mr.menu.id,
                label: mr.menu.menuName,
                path: mr.menu.path,
                icon: mr.menu.icon,
                module: mr.menu.module,
                children: [],
                parentId: mr.menu.parentId,
            };
            menuMap.set(menu.id, menu);
        });
        menuMap.forEach((menu) => {
            if (menu.parentId) {
                const parent = menuMap.get(menu.parentId);
                if (parent) {
                    parent.children.push(menu);
                }
            }
            else {
                rootMenus.push(menu);
            }
        });
        return rootMenus;
    }
    async logout(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { token: null },
        });
    }
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken);
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });
            if (!user || user.token !== refreshToken) {
                throw new common_1.UnauthorizedException();
            }
            const newAccessToken = this.jwtService.sign({
                sub: user.id,
                username: user.username,
            });
            return { accessToken: newAccessToken };
        }
        catch {
            throw new common_1.UnauthorizedException();
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map