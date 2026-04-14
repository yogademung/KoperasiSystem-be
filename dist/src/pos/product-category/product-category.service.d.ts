import { PrismaService } from 'src/database/prisma.service';
export declare class ProductCategoryService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        name: string;
        description?: string;
        parentId?: number;
    }): Promise<{
        id: number;
        description: string | null;
        updatedAt: Date | null;
        name: string;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        parentId: number | null;
        level: number;
    }>;
    findAll(): Promise<({
        parent: {
            id: number;
            description: string | null;
            updatedAt: Date | null;
            name: string;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            parentId: number | null;
            level: number;
        } | null;
        children: {
            id: number;
            description: string | null;
            updatedAt: Date | null;
            name: string;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            parentId: number | null;
            level: number;
        }[];
    } & {
        id: number;
        description: string | null;
        updatedAt: Date | null;
        name: string;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        parentId: number | null;
        level: number;
    })[]>;
    findOne(id: number): Promise<{
        parent: {
            id: number;
            description: string | null;
            updatedAt: Date | null;
            name: string;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            parentId: number | null;
            level: number;
        } | null;
        children: {
            id: number;
            description: string | null;
            updatedAt: Date | null;
            name: string;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            parentId: number | null;
            level: number;
        }[];
    } & {
        id: number;
        description: string | null;
        updatedAt: Date | null;
        name: string;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        parentId: number | null;
        level: number;
    }>;
    update(id: number, data: {
        name?: string;
        description?: string;
        isActive?: boolean;
    }): Promise<{
        id: number;
        description: string | null;
        updatedAt: Date | null;
        name: string;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        parentId: number | null;
        level: number;
    }>;
    remove(id: number): Promise<{
        id: number;
        description: string | null;
        updatedAt: Date | null;
        name: string;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        parentId: number | null;
        level: number;
    }>;
}
