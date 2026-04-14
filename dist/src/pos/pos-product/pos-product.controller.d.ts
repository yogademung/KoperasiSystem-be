import { PosProductService } from './pos-product.service';
export declare class PosProductController {
    private readonly posProductService;
    constructor(posProductService: PosProductService);
    create(data: any): Promise<{
        category: {
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date | null;
            id: number;
            description: string | null;
            parentId: number | null;
            level: number;
            createdBy: string | null;
        };
        recipes: ({
            inventoryItem: {
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date | null;
                id: number;
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
    } & {
        code: string;
        name: string;
        sellingPrice: import("@prisma/client/runtime/library").Decimal;
        cogs: import("@prisma/client/runtime/library").Decimal;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date | null;
        id: number;
        categoryId: number;
    }>;
    findAll(): Promise<({
        category: {
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date | null;
            id: number;
            description: string | null;
            parentId: number | null;
            level: number;
            createdBy: string | null;
        };
        recipes: ({
            inventoryItem: {
                uom: {
                    code: string;
                    name: string;
                    isActive: boolean;
                    id: number;
                };
            } & {
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date | null;
                id: number;
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
    } & {
        code: string;
        name: string;
        sellingPrice: import("@prisma/client/runtime/library").Decimal;
        cogs: import("@prisma/client/runtime/library").Decimal;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date | null;
        id: number;
        categoryId: number;
    })[]>;
    findOne(id: string): Promise<{
        category: {
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date | null;
            id: number;
            description: string | null;
            parentId: number | null;
            level: number;
            createdBy: string | null;
        };
        recipes: ({
            inventoryItem: {
                uom: {
                    code: string;
                    name: string;
                    isActive: boolean;
                    id: number;
                };
            } & {
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date | null;
                id: number;
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
    } & {
        code: string;
        name: string;
        sellingPrice: import("@prisma/client/runtime/library").Decimal;
        cogs: import("@prisma/client/runtime/library").Decimal;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date | null;
        id: number;
        categoryId: number;
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
        code: string;
        name: string;
        sellingPrice: import("@prisma/client/runtime/library").Decimal;
        cogs: import("@prisma/client/runtime/library").Decimal;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date | null;
        id: number;
        categoryId: number;
    }>;
    remove(id: string): Promise<{
        code: string;
        name: string;
        sellingPrice: import("@prisma/client/runtime/library").Decimal;
        cogs: import("@prisma/client/runtime/library").Decimal;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date | null;
        id: number;
        categoryId: number;
    }>;
}
