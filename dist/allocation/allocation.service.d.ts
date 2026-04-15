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
            };
        } & {
            id: number;
            costCenterId: number;
            targetPercentage: import("@prisma/client/runtime/library").Decimal | null;
            fixedAmount: import("@prisma/client/runtime/library").Decimal | null;
            weight: import("@prisma/client/runtime/library").Decimal | null;
            ruleId: number;
        })[];
    } & {
        id: number;
        isActive: boolean;
        createdBy: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        sourceAccountCode: string;
        allocationMethod: import(".prisma/client").$Enums.AllocationMethod;
        customFormula: string | null;
    })[]>;
    findOneRule(id: number): Promise<{
        targets: ({
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
            };
        } & {
            id: number;
            costCenterId: number;
            targetPercentage: import("@prisma/client/runtime/library").Decimal | null;
            fixedAmount: import("@prisma/client/runtime/library").Decimal | null;
            weight: import("@prisma/client/runtime/library").Decimal | null;
            ruleId: number;
        })[];
    } & {
        id: number;
        isActive: boolean;
        createdBy: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        sourceAccountCode: string;
        allocationMethod: import(".prisma/client").$Enums.AllocationMethod;
        customFormula: string | null;
    }>;
    createRule(data: any, userId: number): Promise<{
        id: number;
        isActive: boolean;
        createdBy: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        sourceAccountCode: string;
        allocationMethod: import(".prisma/client").$Enums.AllocationMethod;
        customFormula: string | null;
    }>;
    deleteRule(id: number): Promise<{
        id: number;
        isActive: boolean;
        createdBy: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        sourceAccountCode: string;
        allocationMethod: import(".prisma/client").$Enums.AllocationMethod;
        customFormula: string | null;
    }>;
    previewAllocation(ruleId: number, year: number, month: number): Promise<{
        rule: {
            targets: ({
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
                };
            } & {
                id: number;
                costCenterId: number;
                targetPercentage: import("@prisma/client/runtime/library").Decimal | null;
                fixedAmount: import("@prisma/client/runtime/library").Decimal | null;
                weight: import("@prisma/client/runtime/library").Decimal | null;
                ruleId: number;
            })[];
        } & {
            id: number;
            isActive: boolean;
            createdBy: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
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
            };
        } & {
            id: number;
            costCenterId: number;
            allocatedAmount: import("@prisma/client/runtime/library").Decimal;
            percentage: import("@prisma/client/runtime/library").Decimal | null;
            calculationBasis: import("@prisma/client/runtime/library").Decimal | null;
            executionId: number;
        })[];
        executor: {
            fullName: string;
        };
        rule: {
            id: number;
            isActive: boolean;
            createdBy: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            sourceAccountCode: string;
            allocationMethod: import(".prisma/client").$Enums.AllocationMethod;
            customFormula: string | null;
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
