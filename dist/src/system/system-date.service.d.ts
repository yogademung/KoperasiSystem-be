import { PrismaService } from '../database/prisma.service';
export declare class SystemDateService {
    private prisma;
    constructor(prisma: PrismaService);
    getCurrentBusinessDate(): Promise<Date>;
    getServerDate(): Date;
    isDateMismatch(): Promise<boolean>;
    getUnclosedShifts(date?: Date): Promise<({
        user: {
            id: number;
            fullName: string;
        };
    } & {
        id: number;
        updatedAt: Date;
        createdAt: Date;
        status: string;
        userId: number;
        shiftDate: Date;
        startTime: Date;
        endTime: Date | null;
        startingCash: import("@prisma/client/runtime/library").Decimal;
        startDenom100k: number;
        startDenom50k: number;
        startDenom20k: number;
        startDenom10k: number;
        startDenom5k: number;
        startDenom2k: number;
        startDenom1k: number;
        startDenom500: number;
        startDenom200: number;
        startDenom100: number;
        endingCash: import("@prisma/client/runtime/library").Decimal | null;
        endDenom100k: number | null;
        endDenom50k: number | null;
        endDenom20k: number | null;
        endDenom10k: number | null;
        endDenom5k: number | null;
        endDenom2k: number | null;
        endDenom1k: number | null;
        endDenom500: number | null;
        endDenom200: number | null;
        endDenom100: number | null;
        totalDeposits: import("@prisma/client/runtime/library").Decimal;
        totalWithdrawals: import("@prisma/client/runtime/library").Decimal;
        transactionCount: number;
        closingJournalId: number | null;
    })[]>;
    canAdvanceDate(): Promise<boolean>;
    advanceBusinessDate(): Promise<{
        success: boolean;
        newDate?: Date;
        message: string;
    }>;
    getSystemStatus(): Promise<{
        businessDate: string;
        serverDate: string;
        isDateMismatch: boolean;
        unclosedShifts: {
            collectorName: string;
            startTime: Date;
        }[];
        unclosedShiftCount: number;
        canAdvanceDate: boolean;
    }>;
}
