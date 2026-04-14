import { PosSaleService } from './pos-sale.service';
export declare class PosSaleController {
    private readonly posSaleService;
    constructor(posSaleService: PosSaleService);
    getDrafts(shiftId: number): Promise<({
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
    })[]>;
    saveDraft(data: any): Promise<{
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
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            cogsPrice: import("@prisma/client/runtime/library").Decimal;
            totalPrice: import("@prisma/client/runtime/library").Decimal;
            posProductId: number;
            saleId: number;
        }[];
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
    }>;
}
