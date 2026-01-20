import { AllocationService } from './allocation.service';
export declare class AllocationController {
    private readonly allocationService;
    constructor(allocationService: AllocationService);
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
    createRule(data: any, req: any): Promise<{
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
    findOneRule(id: string): Promise<{
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
    deleteRule(id: string): Promise<{
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
    preview(body: {
        ruleId: number;
        year: number;
        month: number;
    }): Promise<{
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
    execute(body: {
        ruleId: number;
        year: number;
        month: number;
    }, req: any): Promise<{
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
    getExecutions(year?: string, month?: string): Promise<({
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
    rollback(id: string, req: any): Promise<{
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
}
