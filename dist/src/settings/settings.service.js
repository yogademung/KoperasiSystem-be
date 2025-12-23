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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const PROFILE_CODE = 'COMPANY_PROFILE';
const KEYS = ['NAME', 'ADDRESS', 'PHONE', 'EMAIL', 'WEBSITE', 'LOGO', 'THEME_COLOR'];
let SettingsService = class SettingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        await this.ensureDefaults();
    }
    async ensureDefaults() {
        const count = await this.prisma.lovValue.count({ where: { code: PROFILE_CODE } });
        if (count === 0) {
            const defaults = [
                { codeValue: 'NAME', description: 'Koperasi Simpan Pinjam Sejahtera' },
                { codeValue: 'ADDRESS', description: 'Jl. Raya Utama No. 123, Denpasar, Bali' },
                { codeValue: 'PHONE', description: '(0361) 123456' },
                { codeValue: 'EMAIL', description: 'info@kspsejahtera.com' },
                { codeValue: 'WEBSITE', description: 'www.kspsejahtera.com' },
                { codeValue: 'LOGO', description: '' },
                { codeValue: 'THEME_COLOR', description: 'oklch(0.208 0.042 265.755)' },
            ];
            for (const d of defaults) {
                await this.prisma.lovValue.create({
                    data: {
                        code: PROFILE_CODE,
                        codeValue: d.codeValue,
                        description: d.description,
                        orderNum: 0,
                        isActive: true,
                        createdBy: 'SYSTEM'
                    }
                });
            }
            console.log('✅ Company Profile defaults seeded.');
        }
    }
    async getProfile() {
        const items = await this.prisma.lovValue.findMany({
            where: { code: PROFILE_CODE, isActive: true }
        });
        const profile = {};
        KEYS.forEach(k => {
            const found = items.find(i => i.codeValue === k);
            profile[k.toLowerCase()] = found?.description || '';
        });
        return profile;
    }
    async updateProfile(data) {
        for (const key of KEYS) {
            const val = data[key.toLowerCase()];
            if (val !== undefined) {
                await this.prisma.lovValue.upsert({
                    where: {
                        code_codeValue: {
                            code: PROFILE_CODE,
                            codeValue: key
                        }
                    },
                    update: { description: val, updatedAt: new Date(), updatedBy: 'ADMIN' },
                    create: {
                        code: PROFILE_CODE,
                        codeValue: key,
                        description: val,
                        isActive: true,
                        createdBy: 'ADMIN'
                    }
                });
            }
        }
        return this.getProfile();
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map