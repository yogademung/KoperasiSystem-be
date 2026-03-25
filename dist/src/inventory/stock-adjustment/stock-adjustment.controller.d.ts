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
        inventoryItemId: number;
        averageCost: import("@prisma/client/runtime/library").Decimal;
        warehouseId: number | null;
        adjustmentDate: Date;
        adjustmentQty: import("@prisma/client/runtime/library").Decimal;
    }>;
    findAll(): Promise<({
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
        warehouse: {
            id: number;
            name: string;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            code: string;
            address: string | null;
        } | null;
    } & {
        id: number;
        createdBy: string | null;
        createdAt: Date;
        status: string;
        reason: string | null;
        inventoryItemId: number;
        averageCost: import("@prisma/client/runtime/library").Decimal;
        warehouseId: number | null;
        adjustmentDate: Date;
        adjustmentQty: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    createBulk(data: any): Promise<{
        success: boolean;
        adjustmentsMade: number;
    }>;
}
