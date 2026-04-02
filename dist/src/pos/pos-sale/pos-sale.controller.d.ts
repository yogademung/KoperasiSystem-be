import { PosSaleService } from './pos-sale.service';
export declare class PosSaleController {
    private readonly posSaleService;
    constructor(posSaleService: PosSaleService);
    getDrafts(shiftId: number): Promise<({
        items: ({
            posProduct: {
                id: number;
                name: string;
                code: string;
                categoryId: number;
                sellingPrice: import("@prisma/client/runtime/library").Decimal;
                cogs: import("@prisma/client/runtime/library").Decimal;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date | null;
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
        id: number;
        shiftId: number;
        receiptNumber: string;
        saleDate: Date;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string;
        paymentAmount: import("@prisma/client/runtime/library").Decimal;
        changeAmount: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        discountNote: string | null;
        status: string;
        createdBy: string | null;
    })[]>;
    saveDraft(data: any): Promise<{
        items: ({
            posProduct: {
                id: number;
                name: string;
                code: string;
                categoryId: number;
                sellingPrice: import("@prisma/client/runtime/library").Decimal;
                cogs: import("@prisma/client/runtime/library").Decimal;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date | null;
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
        id: number;
        shiftId: number;
        receiptNumber: string;
        saleDate: Date;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string;
        paymentAmount: import("@prisma/client/runtime/library").Decimal;
        changeAmount: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        discountNote: string | null;
        status: string;
        createdBy: string | null;
    }>;
    checkout(data: {
        shiftId: number;
        userId: number;
        paymentMethod: string;
        paymentAmount: number;
        discountAmount?: number;
        discountNote?: string;
        items: {
            posProductId: number;
            quantity: number;
            unitPrice: number;
            cogsPrice: number;
        }[];
    }): Promise<{
        items: {
            id: number;
            createdBy: string | null;
            saleId: number;
            posProductId: number;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            cogsPrice: import("@prisma/client/runtime/library").Decimal;
            totalPrice: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: number;
        shiftId: number;
        receiptNumber: string;
        saleDate: Date;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string;
        paymentAmount: import("@prisma/client/runtime/library").Decimal;
        changeAmount: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        discountNote: string | null;
        status: string;
        createdBy: string | null;
    }>;
}
