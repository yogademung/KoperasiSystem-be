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
        } & {
            quantity: import("@prisma/client/runtime/library").Decimal;
            inventoryItemId: number;
            posProductId: number;
        })[];
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
        } & {
            quantity: import("@prisma/client/runtime/library").Decimal;
            inventoryItemId: number;
            posProductId: number;
        })[];
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
        } & {
            quantity: import("@prisma/client/runtime/library").Decimal;
            inventoryItemId: number;
            posProductId: number;
        })[];
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
        code?: string;
        categoryId?: number;
        recipes?: {
            inventoryItemId: number;
            quantity: number;
        }[];
    }): Promise<{
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date | null;
        name: string;
        code: string;
        categoryId: number;
        sellingPrice: import("@prisma/client/runtime/library").Decimal;
        cogs: import("@prisma/client/runtime/library").Decimal;
    }>;
    remove(id: number): Promise<{
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date | null;
        name: string;
        code: string;
        categoryId: number;
        sellingPrice: import("@prisma/client/runtime/library").Decimal;
        cogs: import("@prisma/client/runtime/library").Decimal;
    }>;
    calculateCogs(id: number): Promise<{
        calculatedCogs: number;
        hasRecipe: boolean;
        details: never[];
        message: string;
        currentCogs?: undefined;
    } | {
        calculatedCogs: number;
        hasRecipe: boolean;
        currentCogs: number;
        details: {
            inventoryItemId: number;
            name: string;
            sku: string;
            uom: string;
            quantityRequired: number;
            averageCost: number;
            subtotal: number;
            warning: string | null;
        }[];
        message: null;
    }>;
    syncCogs(id: number): Promise<{
        calculatedCogs: number;
        hasRecipe: boolean;
        details: never[];
        message: string;
        currentCogs?: undefined;
    } | {
        calculatedCogs: number;
        hasRecipe: boolean;
        currentCogs: number;
        details: {
            inventoryItemId: number;
            name: string;
            sku: string;
            uom: string;
            quantityRequired: number;
            averageCost: number;
            subtotal: number;
            warning: string | null;
        }[];
        message: null;
    } | {
        synced: boolean;
        savedCogs: number;
        calculatedCogs: number;
        hasRecipe: boolean;
        details: never[];
        message: string;
        currentCogs?: undefined;
    } | {
        synced: boolean;
        savedCogs: number;
        calculatedCogs: number;
        hasRecipe: boolean;
        currentCogs: number;
        details: {
            inventoryItemId: number;
            name: string;
            sku: string;
            uom: string;
            quantityRequired: number;
            averageCost: number;
            subtotal: number;
            warning: string | null;
        }[];
        message: null;
    }>;
}
