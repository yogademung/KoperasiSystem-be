import { PrismaService } from 'src/database/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
export declare class InventoryClosingService {
    private prisma;
    constructor(prisma: PrismaService);
    getClosingHistory(period?: string, warehouseId?: number): Promise<({
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
            averageCost: Decimal;
            stockQty: Decimal;
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
        averageCost: Decimal;
        openingStock: Decimal;
        receivingStock: Decimal;
        transferInStock: Decimal;
        transferOutStock: Decimal;
        adjustmentStock: Decimal;
        salesStock: Decimal;
        endingStock: Decimal;
        closedAt: Date;
        closedBy: string | null;
    })[]>;
    runClosing(period: string, userId: string): Promise<{
        message: string;
        totalItems: number;
    }>;
}
