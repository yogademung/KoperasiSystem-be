import { PrismaService } from 'src/database/prisma.service';
import { AccountingService } from 'src/accounting/accounting.service';
export declare class PosShiftService {
    private prisma;
    private accountingService;
    constructor(prisma: PrismaService, accountingService: AccountingService);
    openShift(userId: number, startingCash?: number): Promise<{
        terminalId: string | null;
        shiftDate: Date;
        startTime: Date;
        endTime: Date | null;
        status: string;
        startingCash: import("@prisma/client/runtime/library").Decimal;
        endingCash: import("@prisma/client/runtime/library").Decimal | null;
        totalSales: import("@prisma/client/runtime/library").Decimal;
        journalId: number | null;
        id: number;
        userId: number;
        warehouseId: number | null;
    }>;
    closeShift(shiftId: number, endingCash: number): Promise<{
        terminalId: string | null;
        shiftDate: Date;
        startTime: Date;
        endTime: Date | null;
        status: string;
        startingCash: import("@prisma/client/runtime/library").Decimal;
        endingCash: import("@prisma/client/runtime/library").Decimal | null;
        totalSales: import("@prisma/client/runtime/library").Decimal;
        journalId: number | null;
        id: number;
        userId: number;
        warehouseId: number | null;
    }>;
    getActiveShift(userId: number): Promise<({
        sales: ({
            items: ({
                posProduct: {
                    id: number;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date | null;
                    code: string;
                    categoryId: number;
                    sellingPrice: import("@prisma/client/runtime/library").Decimal;
                    cogs: import("@prisma/client/runtime/library").Decimal;
                    isActive: boolean;
                };
            } & {
                id: number;
                createdBy: string | null;
                saleId: number;
                posProductId: number;
                quantity: import("@prisma/client/runtime/library").Decimal;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                cogsPrice: import("@prisma/client/runtime/library").Decimal;
                totalPrice: import("@prisma/client/runtime/library").Decimal;
            })[];
        } & {
            status: string;
            id: number;
            createdBy: string | null;
            shiftId: number;
            receiptNumber: string;
            saleDate: Date;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            paymentMethod: string;
            paymentAmount: import("@prisma/client/runtime/library").Decimal;
            changeAmount: import("@prisma/client/runtime/library").Decimal;
            discountAmount: import("@prisma/client/runtime/library").Decimal;
            discountNote: string | null;
        })[];
    } & {
        terminalId: string | null;
        shiftDate: Date;
        startTime: Date;
        endTime: Date | null;
        status: string;
        startingCash: import("@prisma/client/runtime/library").Decimal;
        endingCash: import("@prisma/client/runtime/library").Decimal | null;
        totalSales: import("@prisma/client/runtime/library").Decimal;
        journalId: number | null;
        id: number;
        userId: number;
        warehouseId: number | null;
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
        shiftId: number;
        posProductId: number;
        quantity: import("@prisma/client/runtime/library").Decimal;
        reason: string;
    }>;
}
