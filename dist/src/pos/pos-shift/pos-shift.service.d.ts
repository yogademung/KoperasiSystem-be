import { PrismaService } from 'src/database/prisma.service';
import { AccountingService } from 'src/accounting/accounting.service';
export declare class PosShiftService {
    private prisma;
    private accountingService;
    constructor(prisma: PrismaService, accountingService: AccountingService);
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
        warehouseId: number | null;
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
        warehouseId: number | null;
        terminalId: string | null;
        totalSales: import("@prisma/client/runtime/library").Decimal;
    }>;
    getActiveShift(userId: number): Promise<({
        sales: ({
            items: ({
                posProduct: {
                    id: number;
                    updatedAt: Date | null;
                    name: string;
                    isActive: boolean;
                    createdAt: Date;
                    code: string;
                    categoryId: number;
                    sellingPrice: import("@prisma/client/runtime/library").Decimal;
                    cogs: import("@prisma/client/runtime/library").Decimal;
                };
            } & {
                id: number;
                createdBy: string | null;
                quantity: import("@prisma/client/runtime/library").Decimal;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                cogsPrice: import("@prisma/client/runtime/library").Decimal;
                totalPrice: import("@prisma/client/runtime/library").Decimal;
                posProductId: number;
                saleId: number;
            })[];
        } & {
            id: number;
            createdBy: string | null;
            status: string;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            shiftId: number;
            receiptNumber: string;
            saleDate: Date;
            paymentMethod: string;
            paymentAmount: import("@prisma/client/runtime/library").Decimal;
            changeAmount: import("@prisma/client/runtime/library").Decimal;
            discountAmount: import("@prisma/client/runtime/library").Decimal;
            discountNote: string | null;
        })[];
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
        warehouseId: number | null;
        terminalId: string | null;
        totalSales: import("@prisma/client/runtime/library").Decimal;
    }) | null>;
    logVoid(data: {
        shiftId: number;
        posProductId: number;
        quantity: number;
        reason: string;
        createdBy: string;
    }): Promise<{
        id: number;
        createdBy: string | null;
        createdAt: Date;
        reason: string;
        quantity: import("@prisma/client/runtime/library").Decimal;
        shiftId: number;
        posProductId: number;
    }>;
}
