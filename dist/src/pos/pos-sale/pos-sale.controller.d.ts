import { PosSaleService } from './pos-sale.service';
export declare class PosSaleController {
    private readonly posSaleService;
    constructor(posSaleService: PosSaleService);
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
