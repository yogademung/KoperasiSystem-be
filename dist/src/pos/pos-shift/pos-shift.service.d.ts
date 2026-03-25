import { PrismaService } from 'src/database/prisma.service';
export declare class PosShiftService {
    private prisma;
    constructor(prisma: PrismaService);
    openShift(userId: number, startingCash?: number): Promise<{
        id: number;
        status: string;
        userId: number;
        journalId: number | null;
        shiftDate: Date;
        startTime: Date;
        endTime: Date | null;
        startingCash: import("@prisma/client/runtime/library").Decimal;
        endingCash: import("@prisma/client/runtime/library").Decimal | null;
        terminalId: string | null;
        totalSales: import("@prisma/client/runtime/library").Decimal;
    }>;
    closeShift(shiftId: number, endingCash: number): Promise<{
        id: number;
        status: string;
        userId: number;
        journalId: number | null;
        shiftDate: Date;
        startTime: Date;
        endTime: Date | null;
        startingCash: import("@prisma/client/runtime/library").Decimal;
        endingCash: import("@prisma/client/runtime/library").Decimal | null;
        terminalId: string | null;
        totalSales: import("@prisma/client/runtime/library").Decimal;
    }>;
    getActiveShift(userId: number): Promise<({
        sales: {
            id: number;
            status: string;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            receiptNumber: string;
            saleDate: Date;
            paymentMethod: string;
            paymentAmount: import("@prisma/client/runtime/library").Decimal;
            changeAmount: import("@prisma/client/runtime/library").Decimal;
            shiftId: number;
        }[];
    } & {
        id: number;
        status: string;
        userId: number;
        journalId: number | null;
        shiftDate: Date;
        startTime: Date;
        endTime: Date | null;
        startingCash: import("@prisma/client/runtime/library").Decimal;
        endingCash: import("@prisma/client/runtime/library").Decimal | null;
        terminalId: string | null;
        totalSales: import("@prisma/client/runtime/library").Decimal;
    }) | null>;
}
