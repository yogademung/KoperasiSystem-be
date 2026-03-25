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
        updatedAt: Date | null;
        name: string;
        isActive: boolean;
        createdAt: Date;
        categoryId: number;
        sku: string;
        averageCost: import("@prisma/client/runtime/library").Decimal;
        stockQty: import("@prisma/client/runtime/library").Decimal;
        uomId: number;
    }>;
    findAll(): Promise<({
        uom: {
            id: number;
            name: string;
            isActive: boolean;
            code: string;
        };
        category: {
            id: number;
            description: string | null;
            updatedAt: Date | null;
            name: string;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            parentId: number | null;
            level: number;
        };
        warehouseStocks: ({
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
            quantity: import("@prisma/client/runtime/library").Decimal;
            inventoryItemId: number;
            warehouseId: number;
        })[];
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
    })[]>;
    findOne(id: number): Promise<{
        uom: {
            id: number;
            name: string;
            isActive: boolean;
            code: string;
        };
        category: {
            id: number;
            description: string | null;
            updatedAt: Date | null;
            name: string;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            parentId: number | null;
            level: number;
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
    }>;
    update(id: number, data: {
        name?: string;
        categoryId?: number;
        uomId?: number;
        isActive?: boolean;
    }): Promise<{
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
    }>;
    remove(id: number): Promise<{
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
    }>;
}
