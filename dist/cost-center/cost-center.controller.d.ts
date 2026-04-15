import { CostCenterService, CreateCostCenterDto, UpdateCostCenterDto, CostCenterFilters } from './cost-center.service';
export declare class CostCenterController {
    private readonly costCenterService;
    constructor(costCenterService: CostCenterService);
    create(dto: CreateCostCenterDto): Promise<{
        creator: {
            id: number;
            fullName: string;
        };
        parent: {
            id: number;
            isActive: boolean;
            createdBy: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            parentId: number | null;
            businessUnitId: number | null;
            code: string;
            managerId: number | null;
            budget: import("@prisma/client/runtime/library").Decimal | null;
        } | null;
        manager: {
            username: string;
            id: number;
            fullName: string;
        } | null;
    } & {
        id: number;
        isActive: boolean;
        createdBy: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        parentId: number | null;
        businessUnitId: number | null;
        code: string;
        managerId: number | null;
        budget: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    findAll(filters: CostCenterFilters): Promise<{
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
                username: string;
                id: number;
                fullName: string;
            } | null;
        } & {
            id: number;
            isActive: boolean;
            createdBy: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            parentId: number | null;
            businessUnitId: number | null;
            code: string;
            managerId: number | null;
            budget: import("@prisma/client/runtime/library").Decimal | null;
        })[];
        total: number;
    }>;
    getTree(rootId?: number): Promise<any[]>;
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
        manager: {
            username: string;
            id: number;
            fullName: string;
            staffId: string | null;
        } | null;
        children: {
            id: number;
            isActive: boolean;
            name: string;
            code: string;
        }[];
    } & {
        id: number;
        isActive: boolean;
        createdBy: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        parentId: number | null;
        businessUnitId: number | null;
        code: string;
        managerId: number | null;
        budget: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    update(id: number, dto: UpdateCostCenterDto): Promise<{
        parent: {
            id: number;
            isActive: boolean;
            createdBy: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            parentId: number | null;
            businessUnitId: number | null;
            code: string;
            managerId: number | null;
            budget: import("@prisma/client/runtime/library").Decimal | null;
        } | null;
        manager: {
            username: string;
            id: number;
            fullName: string;
        } | null;
    } & {
        id: number;
        isActive: boolean;
        createdBy: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        parentId: number | null;
        businessUnitId: number | null;
        code: string;
        managerId: number | null;
        budget: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    delete(id: number): Promise<{
        id: number;
        isActive: boolean;
        createdBy: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        parentId: number | null;
        businessUnitId: number | null;
        code: string;
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
        isActive: boolean;
        createdBy: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        parentId: number | null;
        businessUnitId: number | null;
        code: string;
        managerId: number | null;
        budget: import("@prisma/client/runtime/library").Decimal | null;
    })[]>;
    getBudgetStatus(id: number, year: number, month?: number): Promise<{
        costCenterId: number;
        budget: import("@prisma/client/runtime/library").Decimal | null;
        actual: number;
        variance: number;
        utilizationPercent: number;
    }>;
}
