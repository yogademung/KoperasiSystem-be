import { PrismaService } from 'src/database/prisma.service';
export declare class PosProductService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        code: string;
        name: string;
        categoryId: number;
        sellingPrice: number;
        cogs?: number;
        recipes?: {
            inventoryItemId: number;
            quantity: number;
        }[];
    }): Promise<{
        recipes: ({
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
        } & {
            quantity: import("@prisma/client/runtime/library").Decimal;
            inventoryItemId: number;
            posProductId: number;
        })[];
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
        code: string;
        categoryId: number;
        sellingPrice: import("@prisma/client/runtime/library").Decimal;
        cogs: import("@prisma/client/runtime/library").Decimal;
    }>;
    findAll(): Promise<({
        recipes: ({
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
        } & {
            quantity: import("@prisma/client/runtime/library").Decimal;
            inventoryItemId: number;
            posProductId: number;
        })[];
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
        code: string;
        categoryId: number;
        sellingPrice: import("@prisma/client/runtime/library").Decimal;
        cogs: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    findOne(id: number): Promise<{
        recipes: ({
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
        } & {
            quantity: import("@prisma/client/runtime/library").Decimal;
            inventoryItemId: number;
            posProductId: number;
        })[];
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
        code: string;
        categoryId: number;
        sellingPrice: import("@prisma/client/runtime/library").Decimal;
        cogs: import("@prisma/client/runtime/library").Decimal;
    }>;
    update(id: number, data: {
        isActive?: boolean;
        sellingPrice?: number;
        cogs?: number;
        name?: string;
    }): Promise<{
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
        code: string;
        categoryId: number;
        sellingPrice: import("@prisma/client/runtime/library").Decimal;
        cogs: import("@prisma/client/runtime/library").Decimal;
    }>;
    remove(id: number): Promise<{
        id: number;
        updatedAt: Date | null;
        name: string;
        isActive: boolean;
        createdAt: Date;
        code: string;
        categoryId: number;
        sellingPrice: import("@prisma/client/runtime/library").Decimal;
        cogs: import("@prisma/client/runtime/library").Decimal;
    }>;
}
