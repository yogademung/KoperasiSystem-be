import { PrismaService } from 'src/database/prisma.service';
export declare class PosSaleService {
    private prisma;
    constructor(prisma: PrismaService);
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
    saveDraft(data: {
        id?: number;
        shiftId: number;
        userId: number;
        items: {
            posProductId: number;
            quantity: number;
            unitPrice: number;
            cogsPrice: number;
            status: string;
        }[];
    }): Promise<{
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
        id?: number;
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
