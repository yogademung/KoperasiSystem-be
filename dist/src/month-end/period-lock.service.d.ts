import { PrismaService } from '../database/prisma.service';
import { BalanceSheetService } from './balance-sheet.service';
import { LovValueService } from './lov-value.service';
export declare class PeriodLockService {
    private prisma;
    private balanceSheetService;
    private lovValueService;
    private readonly logger;
    constructor(prisma: PrismaService, balanceSheetService: BalanceSheetService, lovValueService: LovValueService);
    isPeriodLocked(period: string): Promise<boolean>;
    private getPreviousPeriod;
    private validateSequentialClosing;
    closePeriod(period: string, userId: number): Promise<{
        status: string;
        period: string;
        reason: string | null;
        lockedAt: Date;
        lockedBy: number;
        unlockedAt: Date | null;
        unlockedBy: number | null;
        unlockReason: string | null;
    }>;
    requestUnlock(period: string, userId: number, reason: string): Promise<{
        id: number;
        status: string;
        period: string;
        reason: string;
        requestedAt: Date;
        approvedAt: Date | null;
        managerNotes: string | null;
        requestedBy: number;
        approvedBy: number | null;
    }>;
    adminForceUnlock(period: string, adminId: number, reason: string): Promise<{
        success: boolean;
    }>;
    approveUnlock(requestId: number, managerId: number, notes?: string): Promise<{
        success: boolean;
    }>;
    rejectUnlock(requestId: number, managerId: number, notes?: string): Promise<{
        success: boolean;
    }>;
    getLockedPeriods(): Promise<({
        creator: {
            fullName: string;
        };
    } & {
        status: string;
        period: string;
        reason: string | null;
        lockedAt: Date;
        lockedBy: number;
        unlockedAt: Date | null;
        unlockedBy: number | null;
        unlockReason: string | null;
    })[]>;
}
