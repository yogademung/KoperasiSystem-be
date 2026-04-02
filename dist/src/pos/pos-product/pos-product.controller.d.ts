import { PosProductService } from './pos-product.service';
export declare class PosProductController {
    private readonly posProductService;
    constructor(posProductService: PosProductService);
    create(data: any): Promise<{
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
    findOne(id: string): Promise<{
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
    update(id: string, data: any): Promise<{
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
    remove(id: string): Promise<{
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
