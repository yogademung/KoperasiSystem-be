import { PrismaService } from 'src/database/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
export declare class InventoryClosingService {
    private prisma;
    constructor(prisma: PrismaService);
    getClosingHistory(period?: string, warehouseId?: number): Promise<({
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
            averageCost: Decimal;
            stockQty: Decimal;
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
