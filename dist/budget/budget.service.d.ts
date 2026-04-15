import { PrismaService } from '../database/prisma.service';
import { BudgetPeriodStatus } from '@prisma/client';
export interface CreateBudgetPeriodDto {
    year: number;
    periodName: string;
    startDate: Date;
    endDate: Date;
}
export interface UpdateBudgetPeriodDto {
    periodName?: string;
    startDate?: Date;
    endDate?: Date;
    status?: BudgetPeriodStatus;
}
export interface CreateBudgetDto {
    periodId: number;
    costCenterId?: number;
    businessUnitId?: number;
    accountCode: string;
    budgetAmount: number;
    notes?: string;
}
export interface UpdateBudgetDto {
    budgetAmount?: number;
    notes?: string;
}
export interface BudgetFilters {
    periodId?: number;
    costCenterId?: number;
    businessUnitId?: number;
    accountCode?: string;
    search?: string;
}
export interface PeriodFilters {
    year?: number;
    status?: BudgetPeriodStatus;
}
export declare class BudgetService {
    private prisma;
    constructor(prisma: PrismaService);
    createPeriod(dto: CreateBudgetPeriodDto, userId: number): Promise<{
        creator: {
            id: number;
            fullName: string;
        };
    } & {
        id: number;
        createdBy: number;
        createdAt: Date;
        year: number;
        status: import(".prisma/client").$Enums.BudgetPeriodStatus;
        approvedAt: Date | null;
        approvedBy: number | null;
        startDate: Date;
        endDate: Date;
        periodName: string;
    }>;
    findAllPeriods(filters?: PeriodFilters): Promise<({
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
        year: number;
        status: import(".prisma/client").$Enums.BudgetPeriodStatus;
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
        year: number;
        status: import(".prisma/client").$Enums.BudgetPeriodStatus;
        approvedAt: Date | null;
        approvedBy: number | null;
        startDate: Date;
        endDate: Date;
        periodName: string;
    }>;
    updatePeriod(id: number, dto: UpdateBudgetPeriodDto): Promise<{
        creator: {
            username: string;
            password: string;
            id: number;
            fullName: string;
            staffId: string | null;
            roleId: number | null;
            regionCode: string | null;
            token: string | null;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            isTotpEnabled: boolean;
            totpSecret: string | null;
        };
        approver: {
            username: string;
            password: string;
            id: number;
            fullName: string;
            staffId: string | null;
            roleId: number | null;
            regionCode: string | null;
            token: string | null;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            isTotpEnabled: boolean;
            totpSecret: string | null;
        } | null;
    } & {
        id: number;
        createdBy: number;
        createdAt: Date;
        year: number;
        status: import(".prisma/client").$Enums.BudgetPeriodStatus;
        approvedAt: Date | null;
        approvedBy: number | null;
        startDate: Date;
        endDate: Date;
        periodName: string;
    }>;
    approvePeriod(id: number, userId: number): Promise<{
        id: number;
        createdBy: number;
        createdAt: Date;
        year: number;
        status: import(".prisma/client").$Enums.BudgetPeriodStatus;
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
        year: number;
        status: import(".prisma/client").$Enums.BudgetPeriodStatus;
        approvedAt: Date | null;
        approvedBy: number | null;
        startDate: Date;
        endDate: Date;
        periodName: string;
    }>;
    createBudget(dto: CreateBudgetDto, userId: number): Promise<{
        costCenter: {
            id: number;
            name: string;
            code: string;
        } | null;
        businessUnit: {
            id: number;
            name: string;
            code: string;
        } | null;
        period: {
            id: number;
            createdBy: number;
            createdAt: Date;
            year: number;
            status: import(".prisma/client").$Enums.BudgetPeriodStatus;
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
    } & {
        id: number;
        createdBy: number;
        createdAt: Date;
        updatedAt: Date;
        accountCode: string;
        businessUnitId: number | null;
        periodId: number;
        costCenterId: number | null;
        budgetAmount: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
    }>;
    findAllBudgets(filters?: BudgetFilters): Promise<({
        costCenter: {
            id: number;
            name: string;
            code: string;
        } | null;
        businessUnit: {
            id: number;
            name: string;
            code: string;
        } | null;
        period: {
            id: number;
            createdBy: number;
            createdAt: Date;
            year: number;
            status: import(".prisma/client").$Enums.BudgetPeriodStatus;
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
    } & {
        id: number;
        createdBy: number;
        createdAt: Date;
        updatedAt: Date;
        accountCode: string;
        businessUnitId: number | null;
        periodId: number;
        costCenterId: number | null;
        budgetAmount: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
    })[]>;
    findOneBudget(id: number): Promise<{
        costCenter: {
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
        businessUnit: {
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            code: string;
        } | null;
        period: {
            id: number;
            createdBy: number;
            createdAt: Date;
            year: number;
            status: import(".prisma/client").$Enums.BudgetPeriodStatus;
            approvedAt: Date | null;
            approvedBy: number | null;
            startDate: Date;
            endDate: Date;
            periodName: string;
        };
        creator: {
            username: string;
            password: string;
            id: number;
            fullName: string;
            staffId: string | null;
            roleId: number | null;
            regionCode: string | null;
            token: string | null;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            isTotpEnabled: boolean;
            totpSecret: string | null;
        };
    } & {
        id: number;
        createdBy: number;
        createdAt: Date;
        updatedAt: Date;
        accountCode: string;
        businessUnitId: number | null;
        periodId: number;
        costCenterId: number | null;
        budgetAmount: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
    }>;
    updateBudget(id: number, dto: UpdateBudgetDto): Promise<{
        costCenter: {
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
        businessUnit: {
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            code: string;
        } | null;
        period: {
            id: number;
            createdBy: number;
            createdAt: Date;
            year: number;
            status: import(".prisma/client").$Enums.BudgetPeriodStatus;
            approvedAt: Date | null;
            approvedBy: number | null;
            startDate: Date;
            endDate: Date;
            periodName: string;
        };
    } & {
        id: number;
        createdBy: number;
        createdAt: Date;
        updatedAt: Date;
        accountCode: string;
        businessUnitId: number | null;
        periodId: number;
        costCenterId: number | null;
        budgetAmount: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
    }>;
    deleteBudget(id: number): Promise<{
        id: number;
        createdBy: number;
        createdAt: Date;
        updatedAt: Date;
        accountCode: string;
        businessUnitId: number | null;
        periodId: number;
        costCenterId: number | null;
        budgetAmount: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
    }>;
    calculateActual(periodId: number, accountCode: string, costCenterId?: number, businessUnitId?: number): Promise<number>;
    getVarianceReport(periodId: number, costCenterId?: number, businessUnitId?: number): Promise<{
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
            year: number;
            status: import(".prisma/client").$Enums.BudgetPeriodStatus;
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
    copyFromPreviousPeriod(sourcePeriodId: number, targetPeriodId: number, userId: number, adjustmentPercent?: number): Promise<{
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
            year: number;
            status: import(".prisma/client").$Enums.BudgetPeriodStatus;
            approvedAt: Date | null;
            approvedBy: number | null;
            startDate: Date;
            endDate: Date;
            periodName: string;
        };
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
