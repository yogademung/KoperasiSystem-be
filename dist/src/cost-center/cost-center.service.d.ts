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
    create(dto: CreateCostCenterDto, userId: number): Promise<any>;
    findAll(filters?: CostCenterFilters): Promise<{
        data: any;
        total: any;
    }>;
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdateCostCenterDto): Promise<any>;
    delete(id: number): Promise<any>;
    getChildren(id: number): Promise<any>;
    getTree(rootId?: number): Promise<any[]>;
    private isDescendantOf;
    getBudgetStatus(id: number, year: number, month?: number): Promise<{
        costCenterId: number;
        budget: any;
        actual: number;
        variance: number;
        utilizationPercent: number;
    }>;
}
