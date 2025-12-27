import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { BalanceSheetService } from './balance-sheet.service';

@Injectable()
export class PeriodLockService {
    private readonly logger = new Logger(PeriodLockService.name);

    constructor(
        private prisma: PrismaService,
        private balanceSheetService: BalanceSheetService,
    ) { }

    async isPeriodLocked(period: string): Promise<boolean> {
        const lock = await this.prisma.periodLock.findUnique({
            where: { period },
        });
        return lock?.status === 'LOCKED';
    }

    async closePeriod(period: string, userId: number) {
        // 1. Check if already locked
        if (await this.isPeriodLocked(period)) {
            throw new BadRequestException(`Periode ${period} sudah ditutup (locked).`);
        }

        // 2. Validate Balance Sheet
        // This will throw if invalid
        await this.balanceSheetService.validateBalance(period);

        // 3. Process Retained Earnings if Year End
        await this.balanceSheetService.processRetainedEarnings(period, userId);

        // 4. Create Lock
        const lock = await this.prisma.periodLock.create({
            data: {
                period,
                status: 'LOCKED',
                reason: 'Monthly Closing',
                lockedBy: userId,
                lockedAt: new Date(),
            },
        });

        // 5. Log
        await this.prisma.monthEndLog.create({
            data: {
                period,
                action: 'CLOSING',
                status: 'SUCCESS',
                performedBy: userId,
                details: 'Period closed successfully after validation.',
            },
        });

        this.logger.log(`Period ${period} closed by User ${userId}`);
        return lock;
    }

    async requestUnlock(period: string, userId: number, reason: string) {
        const isLocked = await this.isPeriodLocked(period);
        if (!isLocked) {
            throw new BadRequestException(`Periode ${period} tidak sedang tertutup.`);
        }

        // Create Request
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

    async adminForceUnlock(period: string, adminId: number, reason: string) {
        const lock = await this.prisma.periodLock.findUnique({ where: { period } });
        if (!lock || lock.status !== 'LOCKED') {
            throw new BadRequestException(`Periode ${period} tidak terkunci.`);
        }

        // Force Unlock
        await this.prisma.$transaction(async (tx) => {
            // Update Lock
            await tx.periodLock.update({
                where: { period },
                data: {
                    status: 'UNLOCKED',
                    unlockedBy: adminId,
                    unlockedAt: new Date(),
                    unlockReason: `FORCE UNLOCK: ${reason}`,
                },
            });

            // Log
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

    async approveUnlock(requestId: number, managerId: number, notes?: string) {
        const request = await this.prisma.unlockRequest.findUnique({
            where: { id: requestId },
            include: { periodLock: true },
        });

        if (!request) throw new NotFoundException('Unlock Request not found');
        if (request.status !== 'PENDING') throw new BadRequestException('Request is not PENDING');

        // Assume Manager Role check is done by Guard/Controller

        await this.prisma.$transaction(async (tx) => {
            // 1. Update Request
            await tx.unlockRequest.update({
                where: { id: requestId },
                data: {
                    status: 'APPROVED',
                    approvedBy: managerId,
                    approvedAt: new Date(),
                    managerNotes: notes,
                },
            });

            // 2. Unlock Period
            await tx.periodLock.update({
                where: { period: request.period },
                data: {
                    status: 'UNLOCKED',
                    unlockedBy: managerId,
                    unlockedAt: new Date(),
                    unlockReason: `Approved Request #${requestId}: ${request.reason}`,
                },
            });

            // 3. Log
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

    async rejectUnlock(requestId: number, managerId: number, notes?: string) {
        // Reject logic...
        await this.prisma.unlockRequest.update({
            where: { id: requestId },
            data: {
                status: 'REJECTED',
                approvedBy: managerId, // Who rejected it
                approvedAt: new Date(),
                managerNotes: notes
            }
        });
        return { success: true };
    }

    async getLockedPeriods() {
        return this.prisma.periodLock.findMany({
            where: { status: 'LOCKED' },
            orderBy: { period: 'desc' },
            include: { creator: { select: { fullName: true } } }
        });
    }
}
