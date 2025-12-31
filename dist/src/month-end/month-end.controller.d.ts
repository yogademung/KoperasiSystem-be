import { PeriodLockService } from './period-lock.service';
import { DepreciationService } from './depreciation.service';
import { BalanceSheetService } from './balance-sheet.service';
import { LovValueService } from './lov-value.service';
export declare class MonthEndController {
    private readonly periodLockService;
    private readonly depreciationService;
    private readonly balanceSheetService;
    private readonly lovValueService;
    constructor(periodLockService: PeriodLockService, depreciationService: DepreciationService, balanceSheetService: BalanceSheetService, lovValueService: LovValueService);
    checkLockStatus(period: string): Promise<{
        period: string;
        isLocked: boolean;
    }>;
    closePeriod(body: {
        period: string;
    }, req: any): Promise<{
        status: string;
        period: string;
        reason: string | null;
        lockedAt: Date;
        lockedBy: number;
        unlockedAt: Date | null;
        unlockedBy: number | null;
        unlockReason: string | null;
    }>;
    requestUnlock(body: {
        period: string;
        reason: string;
    }, req: any): Promise<{
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
    approveUnlock(body: {
        requestId: number;
        notes: string;
    }, req: any): Promise<{
        success: boolean;
    }>;
    adminForceUnlock(body: {
        period: string;
        reason: string;
    }, req: any): Promise<{
        success: boolean;
    }>;
    previewDepreciation(period: string): Promise<{
        items: {
            asset: {
                id: number;
                status: string;
                createdBy: string | null;
                createdAt: Date;
                updatedBy: string | null;
                updatedAt: Date | null;
                name: string;
                code: string;
                type: string;
                acquisitionDate: Date;
                acquisitionCost: import("@prisma/client/runtime/library").Decimal;
                residualValue: import("@prisma/client/runtime/library").Decimal;
                usefulLifeYears: number;
                depreciationRate: number;
                depreciationMethod: string;
                assetAccountId: string;
                accumDepreciationAccountId: string;
                expenseAccountId: string;
            };
            amount: number;
        }[];
        totalAmount: number;
    }>;
    postDepreciation(body: {
        period: string;
    }, req: any): Promise<{
        message: string;
        success?: undefined;
        count?: undefined;
        total?: undefined;
    } | {
        success: boolean;
        count: number;
        total: number;
        message?: undefined;
    }>;
    validateBalance(period: string): Promise<{
        valid: boolean;
        shu: number;
        assets: number;
    }>;
    getLastClosedPeriod(): Promise<{
        period: string | null;
    }>;
}
