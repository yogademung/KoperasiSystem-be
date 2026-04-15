import { StockAdjustmentService } from './stock-adjustment.service';
export declare class StockAdjustmentController {
    private readonly service;
    constructor(service: StockAdjustmentService);
    create(data: any): Promise<{
        id: number;
        createdBy: string | null;
        createdAt: Date;
        status: string;
        reason: string | null;
        warehouseId: number | null;
        inventoryItemId: number;
        averageCost: import("@prisma/client/runtime/library").Decimal;
        adjustmentDate: Date;
        adjustmentQty: import("@prisma/client/runtime/library").Decimal;
    }>;
    findAll(): Promise<({
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
        warehouse: {
            id: number;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            name: string;
            code: string;
            address: string | null;
        } | null;
    } & {
        id: number;
        createdBy: string | null;
        createdAt: Date;
        status: string;
        reason: string | null;
        warehouseId: number | null;
        inventoryItemId: number;
        averageCost: import("@prisma/client/runtime/library").Decimal;
        adjustmentDate: Date;
        adjustmentQty: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    createBulk(data: any): Promise<{
        success: boolean;
        adjustmentsMade: number;
    }>;
}
