import { PrismaService } from 'src/database/prisma.service';
export declare class StockAdjustmentService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        adjustmentDate: Date;
        inventoryItemId: number;
        warehouseId: number;
        adjustmentQty: number;
        reason?: string;
    }): Promise<{
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
    createBulkOpname(data: {
        adjustmentDate: Date;
        warehouseId: number;
        items: {
            inventoryItemId: number;
            actualQty: number;
            accountCode?: string;
            costAllocation?: string;
        }[];
    }): Promise<{
        success: boolean;
        adjustmentsMade: number;
    }>;
}
