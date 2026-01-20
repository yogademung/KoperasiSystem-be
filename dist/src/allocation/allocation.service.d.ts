import { PrismaService } from '../database/prisma.service';
export declare class AllocationService {
    private prisma;
    constructor(prisma: PrismaService);
    findAllRules(): Promise<({
        creator: {
            fullName: string;
        };
        targets: ({
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
            };
        } & {
            id: number;
            targetPercentage: import("@prisma/client/runtime/library").Decimal | null;
            fixedAmount: import("@prisma/client/runtime/library").Decimal | null;
            weight: import("@prisma/client/runtime/library").Decimal | null;
            costCenterId: number;
            ruleId: number;
        })[];
    } & {
        id: number;
        description: string | null;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        createdBy: number;
        createdAt: Date;
        sourceAccountCode: string;
        allocationMethod: import(".prisma/client").$Enums.AllocationMethod;
        customFormula: string | null;
    })[]>;
    findOneRule(id: number): Promise<{
        targets: ({
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
            };
        } & {
            id: number;
            targetPercentage: import("@prisma/client/runtime/library").Decimal | null;
            fixedAmount: import("@prisma/client/runtime/library").Decimal | null;
            weight: import("@prisma/client/runtime/library").Decimal | null;
            costCenterId: number;
            ruleId: number;
        })[];
    } & {
        id: number;
        description: string | null;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        createdBy: number;
        createdAt: Date;
        sourceAccountCode: string;
        allocationMethod: import(".prisma/client").$Enums.AllocationMethod;
        customFormula: string | null;
    }>;
    createRule(data: any, userId: number): Promise<{
        id: number;
        description: string | null;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        createdBy: number;
        createdAt: Date;
        sourceAccountCode: string;
        allocationMethod: import(".prisma/client").$Enums.AllocationMethod;
        customFormula: string | null;
    }>;
    deleteRule(id: number): Promise<{
        id: number;
        description: string | null;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        createdBy: number;
        createdAt: Date;
        sourceAccountCode: string;
        allocationMethod: import(".prisma/client").$Enums.AllocationMethod;
        customFormula: string | null;
    }>;
    previewAllocation(ruleId: number, year: number, month: number): Promise<{
        rule: {
            targets: ({
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
                };
            } & {
                id: number;
                targetPercentage: import("@prisma/client/runtime/library").Decimal | null;
                fixedAmount: import("@prisma/client/runtime/library").Decimal | null;
                weight: import("@prisma/client/runtime/library").Decimal | null;
                costCenterId: number;
                ruleId: number;
            })[];
        } & {
            id: number;
            description: string | null;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            createdBy: number;
            createdAt: Date;
            sourceAccountCode: string;
            allocationMethod: import(".prisma/client").$Enums.AllocationMethod;
            customFormula: string | null;
        };
        sourceAmount: number;
        period: {
            year: number;
            month: number;
        };
        details: any;
        totalAllocated: any;
    }>;
    executeAllocation(ruleId: number, year: number, month: number, userId: number): Promise<{
        id: number;
        status: import(".prisma/client").$Enums.AllocationExecutionStatus;
        journalId: number | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        periodYear: number;
        periodMonth: number;
        notes: string | null;
        ruleId: number;
        executionDate: Date;
        executedBy: number;
        executedAt: Date;
        rolledBackBy: number | null;
        rolledBackAt: Date | null;
    }>;
    getExecutions(periodYear?: number, periodMonth?: number): Promise<({
        details: ({
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
            };
        } & {
            id: number;
            costCenterId: number;
            allocatedAmount: import("@prisma/client/runtime/library").Decimal;
            percentage: import("@prisma/client/runtime/library").Decimal | null;
            calculationBasis: import("@prisma/client/runtime/library").Decimal | null;
            executionId: number;
        })[];
        rule: {
            id: number;
            description: string | null;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            createdBy: number;
            createdAt: Date;
            sourceAccountCode: string;
            allocationMethod: import(".prisma/client").$Enums.AllocationMethod;
            customFormula: string | null;
        };
        executor: {
            fullName: string;
        };
    } & {
        id: number;
        status: import(".prisma/client").$Enums.AllocationExecutionStatus;
        journalId: number | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        periodYear: number;
        periodMonth: number;
        notes: string | null;
        ruleId: number;
        executionDate: Date;
        executedBy: number;
        executedAt: Date;
        rolledBackBy: number | null;
        rolledBackAt: Date | null;
    })[]>;
    rollbackExecution(id: number, userId: number): Promise<{
        id: number;
        status: import(".prisma/client").$Enums.AllocationExecutionStatus;
        journalId: number | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        periodYear: number;
        periodMonth: number;
        notes: string | null;
        ruleId: number;
        executionDate: Date;
        executedBy: number;
        executedAt: Date;
        rolledBackBy: number | null;
        rolledBackAt: Date | null;
    }>;
    private calculateAllocation;
    private getSourceAmount;
}
