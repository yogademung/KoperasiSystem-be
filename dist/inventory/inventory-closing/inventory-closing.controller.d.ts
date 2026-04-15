import { InventoryClosingService } from './inventory-closing.service';
export declare class InventoryClosingController {
    private readonly closingService;
    constructor(closingService: InventoryClosingService);
    getHistory(period?: string, warehouseId?: string): Promise<({
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
        warehouse: {
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
