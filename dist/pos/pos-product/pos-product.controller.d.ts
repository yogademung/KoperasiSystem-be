import { PosProductService } from './pos-product.service';
export declare class PosProductController {
    private readonly posProductService;
    constructor(posProductService: PosProductService);
    create(data: any): Promise<{
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
    findOne(id: string): Promise<{
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
    calculateCogs(id: string): Promise<{
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
    syncCogs(id: string): Promise<{
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
    update(id: string, data: any): Promise<{
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
    remove(id: string): Promise<{
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
}
