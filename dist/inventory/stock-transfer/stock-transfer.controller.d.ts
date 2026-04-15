import { StockTransferService } from './stock-transfer.service';
export declare class StockTransferController {
    private readonly service;
    constructor(service: StockTransferService);
    create(data: any): Promise<{
        success: boolean;
        transfersMade: number;
        transfers: any[];
    }>;
    findAll(): Promise<({
        inventoryItem: {
            uom: {
                id: number;
                isActive: boolean;
                name: string;
                code: string;
            };
        } & {
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
        fromWarehouse: {
            id: number;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            name: string;
            code: string;
            address: string | null;
        };
        toWarehouse: {
            id: number;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            name: string;
            code: string;
            address: string | null;
        };
    } & {
        id: number;
        createdBy: string | null;
        createdAt: Date;
        status: string;
        journalId: number | null;
        notes: string | null;
        quantity: import("@prisma/client/runtime/library").Decimal;
        inventoryItemId: number;
        averageCost: import("@prisma/client/runtime/library").Decimal;
        transferNumber: string;
        transferDate: Date;
        fromWarehouseId: number;
        toWarehouseId: number;
    })[]>;
}
