import { ProductCategoryService } from './product-category.service';
export declare class ProductCategoryController {
    private readonly productCategoryService;
    constructor(productCategoryService: ProductCategoryService);
    create(data: {
        name: string;
        description?: string;
        parentId?: number;
    }): Promise<{
        id: number;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date | null;
        name: string;
        description: string | null;
        parentId: number | null;
        level: number;
    }>;
    findAll(): Promise<({
        parent: {
            id: number;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            updatedAt: Date | null;
            name: string;
            description: string | null;
            parentId: number | null;
            level: number;
        } | null;
        children: {
            id: number;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            updatedAt: Date | null;
            name: string;
            description: string | null;
            parentId: number | null;
            level: number;
        }[];
    } & {
        id: number;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date | null;
        name: string;
        description: string | null;
        parentId: number | null;
        level: number;
    })[]>;
    findOne(id: string): Promise<{
        parent: {
            id: number;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            updatedAt: Date | null;
            name: string;
            description: string | null;
            parentId: number | null;
            level: number;
        } | null;
        children: {
            id: number;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            updatedAt: Date | null;
            name: string;
            description: string | null;
            parentId: number | null;
            level: number;
        }[];
    } & {
        id: number;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date | null;
        name: string;
        description: string | null;
        parentId: number | null;
        level: number;
    }>;
    update(id: string, data: {
        name?: string;
        description?: string;
        isActive?: boolean;
    }): Promise<{
        id: number;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date | null;
        name: string;
        description: string | null;
        parentId: number | null;
        level: number;
    }>;
    remove(id: string): Promise<{
        id: number;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date | null;
        name: string;
        description: string | null;
        parentId: number | null;
        level: number;
    }>;
}
