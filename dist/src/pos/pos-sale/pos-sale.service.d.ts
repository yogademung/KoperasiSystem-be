import { PrismaService } from 'src/database/prisma.service';
export declare class PosSaleService {
    private prisma;
    constructor(prisma: PrismaService);
    checkout(data: {
        shiftId: number;
        paymentMethod: string;
        paymentAmount: number;
        items: {
            posProductId: number;
            quantity: number;
            unitPrice: number;
            cogsPrice: number;
        }[];
    }): Promise<{
        items: {
            id: number;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            cogsPrice: import("@prisma/client/runtime/library").Decimal;
            totalPrice: import("@prisma/client/runtime/library").Decimal;
            posProductId: number;
            saleId: number;
        }[];
    } & {
        id: number;
        status: string;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        receiptNumber: string;
        saleDate: Date;
        paymentMethod: string;
        paymentAmount: import("@prisma/client/runtime/library").Decimal;
        changeAmount: import("@prisma/client/runtime/library").Decimal;
        shiftId: number;
    }>;
}
