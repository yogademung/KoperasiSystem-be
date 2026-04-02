import { InventoryClosingService } from './inventory-closing.service';
export declare class InventoryClosingController {
    private readonly closingService;
    constructor(closingService: InventoryClosingService);
    getHistory(period?: string, warehouseId?: string): Promise<({
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
        warehouse: {
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
        period: string;
        warehouseId: number;
        inventoryItemId: number;
        averageCost: import("@prisma/client/runtime/library").Decimal;
        openingStock: import("@prisma/client/runtime/library").Decimal;
        receivingStock: import("@prisma/client/runtime/library").Decimal;
        transferInStock: import("@prisma/client/runtime/library").Decimal;
        transferOutStock: import("@prisma/client/runtime/library").Decimal;
        adjustmentStock: import("@prisma/client/runtime/library").Decimal;
        salesStock: import("@prisma/client/runtime/library").Decimal;
        endingStock: import("@prisma/client/runtime/library").Decimal;
        closedAt: Date;
        closedBy: string | null;
    })[]>;
    runClosing(period: string, user: any): Promise<{
        message: string;
        totalItems: number;
    }>;
}
