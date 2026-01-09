import { CostCenterService, CreateCostCenterDto, UpdateCostCenterDto, CostCenterFilters } from './cost-center.service';
export declare class CostCenterController {
    private readonly costCenterService;
    constructor(costCenterService: CostCenterService);
    create(dto: CreateCostCenterDto): Promise<any>;
    findAll(filters: CostCenterFilters): Promise<{
        data: any;
        total: any;
    }>;
    getTree(rootId?: number): Promise<any[]>;
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdateCostCenterDto): Promise<any>;
    delete(id: number): Promise<any>;
    getChildren(id: number): Promise<any>;
    getBudgetStatus(id: number, year: number, month?: number): Promise<{
        costCenterId: number;
        budget: any;
        actual: number;
        variance: number;
        utilizationPercent: number;
    }>;
}
