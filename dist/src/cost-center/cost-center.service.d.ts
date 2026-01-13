import { PrismaService } from '../database/prisma.service';
export interface CreateCostCenterDto {
    code: string;
    name: string;
    description?: string;
    parentId?: number;
    businessUnitId?: number;
    managerId?: number;
    budget?: number;
}
export interface UpdateCostCenterDto {
    name?: string;
    description?: string;
    parentId?: number;
    businessUnitId?: number;
    managerId?: number;
    budget?: number;
    isActive?: boolean;
}
export interface CostCenterFilters {
    search?: string;
    parentId?: number;
    businessUnitId?: number;
    managerId?: number;
    isActive?: boolean;
}
export declare class CostCenterService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateCostCenterDto, userId: number): Promise<{
        creator: {
            id: number;
            fullName: string;
        };
        parent: {
            id: number;
            description: string | null;
            updatedAt: Date;
            name: string;
            businessUnitId: number | null;
            isActive: boolean;
            createdBy: number;
            createdAt: Date;
            code: string;
            parentId: number | null;
            managerId: number | null;
            budget: import("@prisma/client/runtime/library").Decimal | null;
        } | null;
        manager: {
            id: number;
            username: string;
            fullName: string;
        } | null;
    } & {
        id: number;
        description: string | null;
        updatedAt: Date;
        name: string;
        businessUnitId: number | null;
        isActive: boolean;
        createdBy: number;
        createdAt: Date;
        code: string;
        parentId: number | null;
        managerId: number | null;
        budget: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    findAll(filters?: CostCenterFilters): Promise<{
        data: ({
            _count: {
                children: number;
            };
            parent: {
                id: number;
                name: string;
                code: string;
            } | null;
            manager: {
                id: number;
                username: string;
                fullName: string;
            } | null;
        } & {
            id: number;
            description: string | null;
            updatedAt: Date;
            name: string;
            businessUnitId: number | null;
            isActive: boolean;
            createdBy: number;
            createdAt: Date;
            code: string;
            parentId: number | null;
            managerId: number | null;
            budget: import("@prisma/client/runtime/library").Decimal | null;
        })[];
        total: number;
    }>;
    findOne(id: number): Promise<{
        creator: {
            id: number;
            fullName: string;
        };
        parent: {
            id: number;
            name: string;
            code: string;
        } | null;
        children: {
            id: number;
            name: string;
            isActive: boolean;
            code: string;
        }[];
        manager: {
            id: number;
            username: string;
            fullName: string;
            staffId: string | null;
        } | null;
    } & {
        id: number;
        description: string | null;
        updatedAt: Date;
        name: string;
        businessUnitId: number | null;
        isActive: boolean;
        createdBy: number;
        createdAt: Date;
        code: string;
        parentId: number | null;
        managerId: number | null;
        budget: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    update(id: number, dto: UpdateCostCenterDto): Promise<{
        parent: {
            id: number;
            description: string | null;
            updatedAt: Date;
            name: string;
            businessUnitId: number | null;
            isActive: boolean;
            createdBy: number;
            createdAt: Date;
            code: string;
            parentId: number | null;
            managerId: number | null;
            budget: import("@prisma/client/runtime/library").Decimal | null;
        } | null;
        manager: {
            id: number;
            username: string;
            fullName: string;
        } | null;
    } & {
        id: number;
        description: string | null;
        updatedAt: Date;
        name: string;
        businessUnitId: number | null;
        isActive: boolean;
        createdBy: number;
        createdAt: Date;
        code: string;
        parentId: number | null;
        managerId: number | null;
        budget: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    delete(id: number): Promise<{
        id: number;
        description: string | null;
        updatedAt: Date;
        name: string;
        businessUnitId: number | null;
        isActive: boolean;
        createdBy: number;
        createdAt: Date;
        code: string;
        parentId: number | null;
        managerId: number | null;
        budget: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    getChildren(id: number): Promise<({
        _count: {
            children: number;
        };
        manager: {
            id: number;
            fullName: string;
        } | null;
    } & {
        id: number;
        description: string | null;
        updatedAt: Date;
        name: string;
        businessUnitId: number | null;
        isActive: boolean;
        createdBy: number;
        createdAt: Date;
        code: string;
        parentId: number | null;
        managerId: number | null;
        budget: import("@prisma/client/runtime/library").Decimal | null;
    })[]>;
    getTree(rootId?: number): Promise<any[]>;
    private isDescendantOf;
    getBudgetStatus(id: number, year: number, month?: number): Promise<{
        costCenterId: number;
        budget: import("@prisma/client/runtime/library").Decimal | null;
        actual: number;
        variance: number;
        utilizationPercent: number;
    }>;
}
