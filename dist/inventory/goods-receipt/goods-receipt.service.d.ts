import { PrismaService } from 'src/database/prisma.service';
export declare class GoodsReceiptService {
    private prisma;
    constructor(prisma: PrismaService);
    createReceipt(data: {
        receiptDate: Date;
        referenceNo: string;
        warehouseId: number;
        vendorId?: number;
        supplierName?: string;
        isDirectPay?: boolean;
        paymentMethod?: string;
        items: {
            inventoryItemId: number;
            quantity: number;
            unitPrice: number;
        }[];
    }): Promise<({
        vendor: {
            id: number;
            createdBy: string | null;
            createdAt: Date;
            name: string;
            email: string | null;
            status: string;
            code: string;
            address: string | null;
            phone: string | null;
            contactName: string | null;
        } | null;
        warehouse: {
            id: number;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            name: string;
            code: string;
            address: string | null;
        } | null;
        items: ({
            inventoryItem: {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date | null;
                name: string;
                categoryId: number;
                sku: string;
                uomId: number;
                averageCost: import("@prisma/client/runtime/library").Decimal;
                stockQty: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: number;
            quantity: import("@prisma/client/runtime/library").Decimal;
            inventoryItemId: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            totalPrice: import("@prisma/client/runtime/library").Decimal;
            receiptId: number;
        })[];
    } & {
        id: number;
        createdBy: string | null;
        createdAt: Date;
        status: string;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        warehouseId: number | null;
        referenceNo: string | null;
        receiptNumber: string;
        receiptDate: Date;
        vendorId: number | null;
        supplierName: string | null;
    }) | null>;
    findAll(): Promise<({
        vendor: {
            id: number;
            createdBy: string | null;
            createdAt: Date;
            name: string;
            email: string | null;
            status: string;
            code: string;
            address: string | null;
            phone: string | null;
            contactName: string | null;
        } | null;
        warehouse: {
            id: number;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            name: string;
            code: string;
            address: string | null;
        } | null;
        items: ({
            inventoryItem: {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date | null;
                name: string;
                categoryId: number;
                sku: string;
                uomId: number;
                averageCost: import("@prisma/client/runtime/library").Decimal;
                stockQty: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: number;
            quantity: import("@prisma/client/runtime/library").Decimal;
            inventoryItemId: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            totalPrice: import("@prisma/client/runtime/library").Decimal;
            receiptId: number;
        })[];
        invoice: ({
            payments: {
                id: number;
                createdBy: string | null;
                createdAt: Date;
                amount: import("@prisma/client/runtime/library").Decimal;
                journalId: number | null;
                paymentDate: Date;
                referenceNo: string | null;
                paymentMethod: string;
                paymentNumber: string;
                invoiceId: number;
            }[];
        } & {
            id: number;
            createdBy: string | null;
            createdAt: Date;
            status: string;
            journalId: number | null;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            vendorId: number;
            invoiceNumber: string;
            invoiceDate: Date;
            dueDate: Date;
            paidAmount: import("@prisma/client/runtime/library").Decimal;
            receiptId: number | null;
        }) | null;
    } & {
        id: number;
        createdBy: string | null;
        createdAt: Date;
        status: string;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        warehouseId: number | null;
        referenceNo: string | null;
        receiptNumber: string;
        receiptDate: Date;
        vendorId: number | null;
        supplierName: string | null;
    })[]>;
    removeReceipt(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    updateReceipt(id: number, data: any): Promise<({
        vendor: {
            id: number;
            createdBy: string | null;
            createdAt: Date;
            name: string;
            email: string | null;
            status: string;
            code: string;
            address: string | null;
            phone: string | null;
            contactName: string | null;
        } | null;
        warehouse: {
            id: number;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            name: string;
            code: string;
            address: string | null;
        } | null;
        items: ({
            inventoryItem: {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date | null;
                name: string;
                categoryId: number;
                sku: string;
                uomId: number;
                averageCost: import("@prisma/client/runtime/library").Decimal;
                stockQty: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: number;
            quantity: import("@prisma/client/runtime/library").Decimal;
            inventoryItemId: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            totalPrice: import("@prisma/client/runtime/library").Decimal;
            receiptId: number;
        })[];
    } & {
        id: number;
        createdBy: string | null;
        createdAt: Date;
        status: string;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        warehouseId: number | null;
        referenceNo: string | null;
        receiptNumber: string;
        receiptDate: Date;
        vendorId: number | null;
        supplierName: string | null;
    }) | null>;
}
