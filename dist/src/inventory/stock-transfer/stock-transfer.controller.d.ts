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
                name: string;
                isActive: boolean;
                code: string;
            };
        } & {
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
        fromWarehouse: {
            id: number;
            name: string;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            code: string;
            address: string | null;
        };
        toWarehouse: {
            id: number;
            name: string;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
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
