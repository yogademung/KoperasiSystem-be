import { PrismaService } from 'src/database/prisma.service';
export declare class InventoryItemService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        name: string;
        categoryId: number;
        uomId: number;
    }): Promise<{
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
    }>;
    findAll(): Promise<({
        uom: {
            id: number;
            isActive: boolean;
            name: string;
            code: string;
        };
        category: {
            id: number;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            updatedAt: Date | null;
            name: string;
            description: string | null;
            parentId: number | null;
            level: number;
        };
        warehouseStocks: ({
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
            warehouseId: number;
            quantity: import("@prisma/client/runtime/library").Decimal;
            inventoryItemId: number;
        })[];
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
    })[]>;
    findOne(id: number): Promise<{
        uom: {
            id: number;
            isActive: boolean;
            name: string;
            code: string;
        };
        category: {
            id: number;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            updatedAt: Date | null;
            name: string;
            description: string | null;
            parentId: number | null;
            level: number;
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
    }>;
    update(id: number, data: {
        name?: string;
        categoryId?: number;
        uomId?: number;
        isActive?: boolean;
    }): Promise<{
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
    }>;
    remove(id: number): Promise<{
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
    }>;
}
