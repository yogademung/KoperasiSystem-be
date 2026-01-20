import { BudgetService, CreateBudgetPeriodDto, UpdateBudgetPeriodDto, CreateBudgetDto, UpdateBudgetDto } from './budget.service';
export declare class BudgetController {
    private readonly budgetService;
    constructor(budgetService: BudgetService);
    createPeriod(dto: CreateBudgetPeriodDto, req: any): Promise<{
        creator: {
            id: number;
            fullName: string;
        };
    } & {
        id: number;
        createdBy: number;
        createdAt: Date;
        status: import(".prisma/client").$Enums.BudgetPeriodStatus;
        year: number;
        approvedAt: Date | null;
        approvedBy: number | null;
        startDate: Date;
        endDate: Date;
        periodName: string;
    }>;
    findAllPeriods(query: any): Promise<({
        _count: {
            unitBudgets: number;
        };
        creator: {
            id: number;
            fullName: string;
        };
        approver: {
            id: number;
            fullName: string;
        } | null;
    } & {
        id: number;
        createdBy: number;
        createdAt: Date;
        status: import(".prisma/client").$Enums.BudgetPeriodStatus;
        year: number;
        approvedAt: Date | null;
        approvedBy: number | null;
        startDate: Date;
        endDate: Date;
        periodName: string;
    })[]>;
    findOnePeriod(id: number): Promise<{
        _count: {
            unitBudgets: number;
        };
        creator: {
            id: number;
            fullName: string;
        };
        approver: {
            id: number;
            fullName: string;
        } | null;
    } & {
        id: number;
        createdBy: number;
        createdAt: Date;
        status: import(".prisma/client").$Enums.BudgetPeriodStatus;
        year: number;
        approvedAt: Date | null;
        approvedBy: number | null;
        startDate: Date;
        endDate: Date;
        periodName: string;
    }>;
    updatePeriod(id: number, dto: UpdateBudgetPeriodDto): Promise<{
        creator: {
            id: number;
            updatedAt: Date | null;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            username: string;
            password: string;
            fullName: string;
            staffId: string | null;
            regionCode: string | null;
            token: string | null;
            isTotpEnabled: boolean;
            totpSecret: string | null;
            roleId: number | null;
        };
        approver: {
            id: number;
            updatedAt: Date | null;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            username: string;
            password: string;
            fullName: string;
            staffId: string | null;
            regionCode: string | null;
            token: string | null;
            isTotpEnabled: boolean;
            totpSecret: string | null;
            roleId: number | null;
        } | null;
    } & {
        id: number;
        createdBy: number;
        createdAt: Date;
        status: import(".prisma/client").$Enums.BudgetPeriodStatus;
        year: number;
        approvedAt: Date | null;
        approvedBy: number | null;
        startDate: Date;
        endDate: Date;
        periodName: string;
    }>;
    approvePeriod(id: number, req: any): Promise<{
        id: number;
        createdBy: number;
        createdAt: Date;
        status: import(".prisma/client").$Enums.BudgetPeriodStatus;
        year: number;
        approvedAt: Date | null;
        approvedBy: number | null;
        startDate: Date;
        endDate: Date;
        periodName: string;
    }>;
    closePeriod(id: number): Promise<{
        id: number;
        createdBy: number;
        createdAt: Date;
        status: import(".prisma/client").$Enums.BudgetPeriodStatus;
        year: number;
        approvedAt: Date | null;
        approvedBy: number | null;
        startDate: Date;
        endDate: Date;
        periodName: string;
    }>;
    createBudget(dto: CreateBudgetDto, req: any): Promise<{
        businessUnit: {
            id: number;
            name: string;
            code: string;
        } | null;
        period: {
            id: number;
            createdBy: number;
            createdAt: Date;
            status: import(".prisma/client").$Enums.BudgetPeriodStatus;
            year: number;
            approvedAt: Date | null;
            approvedBy: number | null;
            startDate: Date;
            endDate: Date;
            periodName: string;
        };
        creator: {
            id: number;
            fullName: string;
        };
        costCenter: {
            id: number;
            name: string;
            code: string;
        } | null;
    } & {
        id: number;
        updatedAt: Date;
        accountCode: string;
        businessUnitId: number | null;
        createdBy: number;
        createdAt: Date;
        costCenterId: number | null;
        periodId: number;
        budgetAmount: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
    }>;
    findAllBudgets(query: any): Promise<({
        businessUnit: {
            id: number;
            name: string;
            code: string;
        } | null;
        period: {
            id: number;
            createdBy: number;
            createdAt: Date;
            status: import(".prisma/client").$Enums.BudgetPeriodStatus;
            year: number;
            approvedAt: Date | null;
            approvedBy: number | null;
            startDate: Date;
            endDate: Date;
            periodName: string;
        };
        creator: {
            id: number;
            fullName: string;
        };
        costCenter: {
            id: number;
            name: string;
            code: string;
        } | null;
    } & {
        id: number;
        updatedAt: Date;
        accountCode: string;
        businessUnitId: number | null;
        createdBy: number;
        createdAt: Date;
        costCenterId: number | null;
        periodId: number;
        budgetAmount: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
    })[]>;
    findOneBudget(id: number): Promise<{
        businessUnit: {
            id: number;
            description: string | null;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            createdAt: Date;
            code: string;
        } | null;
        period: {
            id: number;
            createdBy: number;
            createdAt: Date;
            status: import(".prisma/client").$Enums.BudgetPeriodStatus;
            year: number;
            approvedAt: Date | null;
            approvedBy: number | null;
            startDate: Date;
            endDate: Date;
            periodName: string;
        };
        creator: {
            id: number;
            updatedAt: Date | null;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            username: string;
            password: string;
            fullName: string;
            staffId: string | null;
            regionCode: string | null;
            token: string | null;
            isTotpEnabled: boolean;
            totpSecret: string | null;
            roleId: number | null;
        };
        costCenter: {
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
    } & {
        id: number;
        updatedAt: Date;
        accountCode: string;
        businessUnitId: number | null;
        createdBy: number;
        createdAt: Date;
        costCenterId: number | null;
        periodId: number;
        budgetAmount: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
    }>;
    updateBudget(id: number, dto: UpdateBudgetDto): Promise<{
        businessUnit: {
            id: number;
            description: string | null;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            createdAt: Date;
            code: string;
        } | null;
        period: {
            id: number;
            createdBy: number;
            createdAt: Date;
            status: import(".prisma/client").$Enums.BudgetPeriodStatus;
            year: number;
            approvedAt: Date | null;
            approvedBy: number | null;
            startDate: Date;
            endDate: Date;
            periodName: string;
        };
        costCenter: {
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
    } & {
        id: number;
        updatedAt: Date;
        accountCode: string;
        businessUnitId: number | null;
        createdBy: number;
        createdAt: Date;
        costCenterId: number | null;
        periodId: number;
        budgetAmount: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
    }>;
    deleteBudget(id: number): Promise<{
        id: number;
        updatedAt: Date;
        accountCode: string;
        businessUnitId: number | null;
        createdBy: number;
        createdAt: Date;
        costCenterId: number | null;
        periodId: number;
        budgetAmount: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
    }>;
    copyBudgets(body: {
        sourcePeriodId: number;
        targetPeriodId: number;
        adjustmentPercent?: number;
    }, req: any): Promise<{
        copiedCount: number;
        targetPeriod: {
            _count: {
                unitBudgets: number;
            };
            creator: {
                id: number;
                fullName: string;
            };
            approver: {
                id: number;
                fullName: string;
            } | null;
        } & {
            id: number;
            createdBy: number;
            createdAt: Date;
            status: import(".prisma/client").$Enums.BudgetPeriodStatus;
            year: number;
            approvedAt: Date | null;
            approvedBy: number | null;
            startDate: Date;
            endDate: Date;
            periodName: string;
        };
    }>;
    getVarianceReport(periodId: number, costCenterId?: string, businessUnitId?: string): Promise<{
        period: {
            _count: {
                unitBudgets: number;
            };
            creator: {
                id: number;
                fullName: string;
            };
            approver: {
                id: number;
                fullName: string;
            } | null;
        } & {
            id: number;
            createdBy: number;
            createdAt: Date;
            status: import(".prisma/client").$Enums.BudgetPeriodStatus;
            year: number;
            approvedAt: Date | null;
            approvedBy: number | null;
            startDate: Date;
            endDate: Date;
            periodName: string;
        };
        summary: {
            totalBudget: number;
            totalActual: number;
            totalVariance: number;
            variancePercent: number;
        };
        details: {
            budgetId: number;
            accountCode: string;
            costCenter: string | undefined;
            businessUnit: string | undefined;
            budget: number;
            actual: number;
            variance: number;
            variancePercent: number;
            status: "UNDER" | "OVER" | "ON_TRACK";
        }[];
    }>;
    getBudgetUtilization(costCenterId: number, periodId: number): Promise<{
        costCenterId: number;
        periodId: number;
        totalBudget: number;
        totalActual: number;
        variance: number;
        utilizationPercent: number;
    }>;
}
