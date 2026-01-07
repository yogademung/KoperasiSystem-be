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
exports.SystemDateService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const date_fns_1 = require("date-fns");
let SystemDateService = class SystemDateService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCurrentBusinessDate() {
        const config = await this.prisma.lovValue.findUnique({
            where: {
                code_codeValue: {
                    code: 'SYSTEM',
                    codeValue: 'CURRENT_BUSINESS_DATE'
                }
            }
        });
        if (!config || !config.description) {
            return (0, date_fns_1.startOfDay)(new Date());
        }
        return (0, date_fns_1.startOfDay)(new Date(config.description));
    }
    getServerDate() {
        return (0, date_fns_1.startOfDay)(new Date());
    }
    async isDateMismatch() {
        const businessDate = await this.getCurrentBusinessDate();
        const serverDate = this.getServerDate();
        return businessDate.getTime() !== serverDate.getTime();
    }
    async getUnclosedShifts(date) {
        const targetDate = date || await this.getCurrentBusinessDate();
        const dayStart = (0, date_fns_1.startOfDay)(targetDate);
        const dayEnd = (0, date_fns_1.endOfDay)(targetDate);
        return this.prisma.collectorShift.findMany({
            where: {
                status: 'ACTIVE',
                startTime: {
                    gte: dayStart,
                    lte: dayEnd
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true
                    }
                }
            }
        });
    }
    async canAdvanceDate() {
        const businessDate = await this.getCurrentBusinessDate();
        const unclosedShifts = await this.getUnclosedShifts(businessDate);
        return unclosedShifts.length === 0;
    }
    async advanceBusinessDate() {
        const canAdvance = await this.canAdvanceDate();
        if (!canAdvance) {
            return {
                success: false,
                message: 'Cannot advance date: There are unclosed shifts'
            };
        }
        const currentBusinessDate = await this.getCurrentBusinessDate();
        const nextBusinessDate = (0, date_fns_1.addDays)(currentBusinessDate, 1);
        const serverDate = this.getServerDate();
        if (nextBusinessDate.getTime() > serverDate.getTime()) {
            return {
                success: false,
                message: 'Business date is already at server date'
            };
        }
        await this.prisma.lovValue.update({
            where: {
                code_codeValue: {
                    code: 'SYSTEM',
                    codeValue: 'CURRENT_BUSINESS_DATE'
                }
            },
            data: {
                description: (0, date_fns_1.format)(nextBusinessDate, 'yyyy-MM-dd'),
                updatedAt: new Date(),
                updatedBy: 'SYSTEM_AUTO_ADVANCE'
            }
        });
        console.log(`✅ Business date advanced: ${(0, date_fns_1.format)(currentBusinessDate, 'yyyy-MM-dd')} → ${(0, date_fns_1.format)(nextBusinessDate, 'yyyy-MM-dd')}`);
        return {
            success: true,
            newDate: nextBusinessDate,
            message: `Business date advanced to ${(0, date_fns_1.format)(nextBusinessDate, 'yyyy-MM-dd')}`
        };
    }
    async getSystemStatus() {
        const businessDate = await this.getCurrentBusinessDate();
        const serverDate = this.getServerDate();
        const isDateMismatch = await this.isDateMismatch();
        const unclosedShifts = await this.getUnclosedShifts(businessDate);
        const canAdvance = await this.canAdvanceDate();
        return {
            businessDate: (0, date_fns_1.format)(businessDate, 'yyyy-MM-dd'),
            serverDate: (0, date_fns_1.format)(serverDate, 'yyyy-MM-dd'),
            isDateMismatch,
            unclosedShifts: unclosedShifts.map(shift => ({
                collectorName: shift.user.fullName,
                startTime: shift.startTime
            })),
            unclosedShiftCount: unclosedShifts.length,
            canAdvanceDate: canAdvance
        };
    }
};
exports.SystemDateService = SystemDateService;
exports.SystemDateService = SystemDateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SystemDateService);
//# sourceMappingURL=system-date.service.js.map