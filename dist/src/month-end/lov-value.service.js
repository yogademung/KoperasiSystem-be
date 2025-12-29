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
exports.LovValueService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let LovValueService = class LovValueService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getValue(code, codeValue) {
        try {
            const lov = await this.prisma.lovValue.findUnique({
                where: { code_codeValue: { code, codeValue } },
            });
            return lov?.description || null;
        }
        catch (error) {
            return null;
        }
    }
    async setValue(code, codeValue, description, userId) {
        return this.prisma.lovValue.upsert({
            where: { code_codeValue: { code, codeValue } },
            update: { description, updatedBy: userId },
            create: { code, codeValue, description, createdBy: userId },
        });
    }
    async getLastClosingMonth() {
        return this.getValue('ACCOUNTING', 'LAST_CLOSING_MONTH');
    }
    async setLastClosingMonth(period, userId) {
        return this.setValue('ACCOUNTING', 'LAST_CLOSING_MONTH', period, userId);
    }
};
exports.LovValueService = LovValueService;
exports.LovValueService = LovValueService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LovValueService);
//# sourceMappingURL=lov-value.service.js.map