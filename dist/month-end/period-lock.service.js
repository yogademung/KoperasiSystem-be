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
var PeriodLockService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeriodLockService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const balance_sheet_service_1 = require("./balance-sheet.service");
const lov_value_service_1 = require("./lov-value.service");
let PeriodLockService = PeriodLockService_1 = class PeriodLockService {
    prisma;
    balanceSheetService;
    lovValueService;
    logger = new common_1.Logger(PeriodLockService_1.name);
    constructor(prisma, balanceSheetService, lovValueService) {
        this.prisma = prisma;
        this.balanceSheetService = balanceSheetService;
        this.lovValueService = lovValueService;
    }
    async isPeriodLocked(period) {
        try {
            this.logger.log(`Checking if period ${period} is locked...`);
            const lock = await this.prisma.periodLock.findUnique({
                where: { period },
            });
            this.logger.log(`DB Lock record for ${period}: ${JSON.stringify(lock)}`);
            if (lock?.status === 'LOCKED') {
                this.logger.log(`Period ${period} is LOCKED (found in DB)`);
                return true;
            }
            else if (lock?.status === 'UNLOCKED') {
                this.logger.log(`Period ${period} is UNLOCKED (found in DB, overrides global config)`);
                return false;
            }
            const lastClosingMonth = await this.lovValueService.getLastClosingMonth();
            this.logger.log(`Last Closing Month from config: ${lastClosingMonth}`);
            if (lastClosingMonth && period <= lastClosingMonth) {
                this.logger.log(`Period ${period} is LOCKED (${period} <= ${lastClosingMonth})`);
                return true;
            }
            this.logger.log(`Period ${period} is UNLOCKED`);
            return false;
        }
        catch (error) {
            this.logger.error(`Error checking period lock status for ${period}:`, error);
            return false;
        }
    }
    getPreviousPeriod(period) {
        const [year, month] = period.split('-').map(Number);
        if (month === 1) {
            return `${year - 1}-12`;
        }
        return `${year}-${String(month - 1).padStart(2, '0')}`;
    }
    async validateSequentialClosing(period) {
        const lastClosedPeriod = await this.lovValueService.getLastClosingMonth();
        if (!lastClosedPeriod) {
            this.logger.log(`First month-end closing for implementation`);
            return;
        }
        const previousPeriod = this.getPreviousPeriod(period);
        const isPreviousLocked = await this.isPeriodLocked(previousPeriod);
        if (!isPreviousLocked && previousPeriod !== lastClosedPeriod) {
            throw new common_1.BadRequestException(`Periode ${previousPeriod} belum ditutup. ` +
                `Harap tutup periode sebelumnya terlebih dahulu untuk menjaga urutan penutupan.`);
        }
    }
    async closePeriod(period, userId) {
        if (await this.isPeriodLocked(period)) {
            throw new common_1.BadRequestException(`Periode ${period} sudah ditutup (locked).`);
        }
        await this.validateSequentialClosing(period);
        await this.balanceSheetService.validateBalance(period);
        await this.balanceSheetService.processRetainedEarnings(period, userId);
        const lock = await this.prisma.periodLock.create({
            data: {
                period,
                status: 'LOCKED',
                reason: 'Monthly Closing',
                lockedBy: userId,
                lockedAt: new Date(),
            },
        });
        await this.lovValueService.setLastClosingMonth(period, userId.toString());
        await this.prisma.monthEndLog.create({
            data: {
                period,
                action: 'CLOSING',
                status: 'SUCCESS',
                performedBy: userId,
                details: `Period ${period} closed successfully with sequential validation.`,
            },
        });
        this.logger.log(`Period ${period} closed by User ${userId}`);
        return lock;
    }
    async requestUnlock(period, userId, reason) {
        const isLocked = await this.isPeriodLocked(period);
        if (!isLocked) {
            throw new common_1.BadRequestException(`Periode ${period} tidak sedang tertutup.`);
        }
        const request = await this.prisma.unlockRequest.create({
            data: {
                period,
                requestedBy: userId,
                reason,
                status: 'PENDING',
            },
        });
        return request;
    }
    async adminForceUnlock(period, adminId, reason) {
        const lock = await this.prisma.periodLock.findUnique({ where: { period } });
        if (!lock || lock.status !== 'LOCKED') {
            throw new common_1.BadRequestException(`Periode ${period} tidak terkunci.`);
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.periodLock.update({
                where: { period },
                data: {
                    status: 'UNLOCKED',
                    unlockedBy: adminId,
                    unlockedAt: new Date(),
                    unlockReason: `FORCE UNLOCK: ${reason}`,
                },
            });
            await tx.monthEndLog.create({
                data: {
                    period,
                    action: 'FORCE_UNLOCK',
                    status: 'SUCCESS',
                    performedBy: adminId,
                    details: `Force unlock by Admin. Reason: ${reason}`,
                },
            });
        });
        this.logger.log(`Period ${period} FORCE UNLOCKED by Admin ${adminId}`);
        return { success: true };
    }
    async approveUnlock(requestId, managerId, notes) {
        const request = await this.prisma.unlockRequest.findUnique({
            where: { id: requestId },
            include: { periodLock: true },
        });
        if (!request)
            throw new common_1.NotFoundException('Unlock Request not found');
        if (request.status !== 'PENDING')
            throw new common_1.BadRequestException('Request is not PENDING');
        await this.prisma.$transaction(async (tx) => {
            await tx.unlockRequest.update({
                where: { id: requestId },
                data: {
                    status: 'APPROVED',
                    approvedBy: managerId,
                    approvedAt: new Date(),
                    managerNotes: notes,
                },
            });
            await tx.periodLock.update({
                where: { period: request.period },
                data: {
                    status: 'UNLOCKED',
                    unlockedBy: managerId,
                    unlockedAt: new Date(),
                    unlockReason: `Approved Request #${requestId}: ${request.reason}`,
                },
            });
            await tx.monthEndLog.create({
                data: {
                    period: request.period,
                    action: 'UNLOCK_APPROVED',
                    status: 'SUCCESS',
                    performedBy: managerId,
                    details: `Unlock Request #${requestId} Approved.`,
                },
            });
        });
        return { success: true };
    }
    async rejectUnlock(requestId, managerId, notes) {
        await this.prisma.unlockRequest.update({
            where: { id: requestId },
            data: {
                status: 'REJECTED',
                approvedBy: managerId,
                approvedAt: new Date(),
                managerNotes: notes,
            },
        });
        return { success: true };
    }
    async getLockedPeriods() {
        return this.prisma.periodLock.findMany({
            where: { status: 'LOCKED' },
            orderBy: { period: 'desc' },
            include: { creator: { select: { fullName: true } } },
        });
    }
};
exports.PeriodLockService = PeriodLockService;
exports.PeriodLockService = PeriodLockService = PeriodLockService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        balance_sheet_service_1.BalanceSheetService,
        lov_value_service_1.LovValueService])
], PeriodLockService);
//# sourceMappingURL=period-lock.service.js.map