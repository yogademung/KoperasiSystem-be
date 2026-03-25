import { GoodsReceiptService } from './goods-receipt.service';
export declare class GoodsReceiptController {
    private readonly receiptService;
    constructor(receiptService: GoodsReceiptService);
    createReceipt(data: any): Promise<({
        vendor: {
            id: number;
            name: string;
            createdBy: string | null;
            createdAt: Date;
            code: string;
            status: string;
            email: string | null;
            address: string | null;
            phone: string | null;
            contactName: string | null;
        } | null;
        warehouse: {
            id: number;
            name: string;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            code: string;
            address: string | null;
        } | null;
        items: ({
            inventoryItem: {
                id: number;
                updatedAt: Date | null;
                name: string;
                isActive: boolean;
                createdAt: Date;
                categoryId: number;
                sku: string;
                averageCost: import("@prisma/client/runtime/library").Decimal;
                stockQty: import("@prisma/client/runtime/library").Decimal;
                uomId: number;
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
        referenceNo: string | null;
        receiptNumber: string;
        receiptDate: Date;
        vendorId: number | null;
        supplierName: string | null;
        warehouseId: number | null;
    }) | null>;
    findAll(): Promise<({
        vendor: {
            id: number;
            name: string;
            createdBy: string | null;
            createdAt: Date;
            code: string;
            status: string;
            email: string | null;
            address: string | null;
            phone: string | null;
            contactName: string | null;
        } | null;
        warehouse: {
            id: number;
            name: string;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            code: string;
            address: string | null;
        } | null;
        items: ({
            inventoryItem: {
                id: number;
                updatedAt: Date | null;
                name: string;
                isActive: boolean;
                createdAt: Date;
                categoryId: number;
                sku: string;
                averageCost: import("@prisma/client/runtime/library").Decimal;
                stockQty: import("@prisma/client/runtime/library").Decimal;
                uomId: number;
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
                referenceNo: string | null;
                paymentMethod: string;
                paymentNumber: string;
                paymentDate: Date;
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
        referenceNo: string | null;
        receiptNumber: string;
        receiptDate: Date;
        vendorId: number | null;
        supplierName: string | null;
        warehouseId: number | null;
    })[]>;
    updateReceipt(id: string, data: any): Promise<({
        vendor: {
            id: number;
            name: string;
            createdBy: string | null;
            createdAt: Date;
            code: string;
            status: string;
            email: string | null;
            address: string | null;
            phone: string | null;
            contactName: string | null;
        } | null;
        warehouse: {
            id: number;
            name: string;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            code: string;
            address: string | null;
        } | null;
        items: ({
            inventoryItem: {
                id: number;
                updatedAt: Date | null;
                name: string;
                isActive: boolean;
                createdAt: Date;
                categoryId: number;
                sku: string;
                averageCost: import("@prisma/client/runtime/library").Decimal;
                stockQty: import("@prisma/client/runtime/library").Decimal;
                uomId: number;
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
        referenceNo: string | null;
        receiptNumber: string;
        receiptDate: Date;
        vendorId: number | null;
        supplierName: string | null;
        warehouseId: number | null;
    }) | null>;
    removeReceipt(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
