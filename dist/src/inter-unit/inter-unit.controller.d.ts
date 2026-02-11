import { InterUnitService, CreateInterUnitTransactionDto, InterUnitTransactionFilters } from './inter-unit.service';
export declare class InterUnitController {
    private readonly interUnitService;
    constructor(interUnitService: InterUnitService);
    createTransaction(dto: CreateInterUnitTransactionDto): Promise<{
        creator: {
            fullName: string;
        };
    } & {
        status: import(".prisma/client").$Enums.InterUnitTransactionStatus;
        createdBy: number;
        createdAt: Date;
        id: number;
        description: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        journalId: number | null;
        transactionDate: Date;
        sourceUnitId: number;
        destUnitId: number;
        transactionType: import(".prisma/client").$Enums.InterUnitTransactionType;
        referenceNo: string | null;
        eliminationJournalId: number | null;
        approvedBy: number | null;
    }>;
    getTransactions(filters: InterUnitTransactionFilters): Promise<{
        data: ({
            creator: {
                fullName: string;
            };
            approver: {
                fullName: string;
            } | null;
        } & {
            status: import(".prisma/client").$Enums.InterUnitTransactionStatus;
            createdBy: number;
            createdAt: Date;
            id: number;
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            journalId: number | null;
            transactionDate: Date;
            sourceUnitId: number;
            destUnitId: number;
            transactionType: import(".prisma/client").$Enums.InterUnitTransactionType;
            referenceNo: string | null;
            eliminationJournalId: number | null;
            approvedBy: number | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getTransaction(id: number): Promise<{
        creator: {
            username: string;
            fullName: string;
        };
        approver: {
            username: string;
            fullName: string;
        } | null;
    } & {
        status: import(".prisma/client").$Enums.InterUnitTransactionStatus;
        createdBy: number;
        createdAt: Date;
        id: number;
        description: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        journalId: number | null;
        transactionDate: Date;
        sourceUnitId: number;
        destUnitId: number;
        transactionType: import(".prisma/client").$Enums.InterUnitTransactionType;
        referenceNo: string | null;
        eliminationJournalId: number | null;
        approvedBy: number | null;
    }>;
    approveTransaction(id: number): Promise<{
        status: import(".prisma/client").$Enums.InterUnitTransactionStatus;
        createdBy: number;
        createdAt: Date;
        id: number;
        description: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        journalId: number | null;
        transactionDate: Date;
        sourceUnitId: number;
        destUnitId: number;
        transactionType: import(".prisma/client").$Enums.InterUnitTransactionType;
        referenceNo: string | null;
        eliminationJournalId: number | null;
        approvedBy: number | null;
    }>;
    postTransaction(id: number): Promise<{
        status: import(".prisma/client").$Enums.InterUnitTransactionStatus;
        createdBy: number;
        createdAt: Date;
        id: number;
        description: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        journalId: number | null;
        transactionDate: Date;
        sourceUnitId: number;
        destUnitId: number;
        transactionType: import(".prisma/client").$Enums.InterUnitTransactionType;
        referenceNo: string | null;
        eliminationJournalId: number | null;
        approvedBy: number | null;
    }>;
    deleteTransaction(id: number): Promise<{
        status: import(".prisma/client").$Enums.InterUnitTransactionStatus;
        createdBy: number;
        createdAt: Date;
        id: number;
        description: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        journalId: number | null;
        transactionDate: Date;
        sourceUnitId: number;
        destUnitId: number;
        transactionType: import(".prisma/client").$Enums.InterUnitTransactionType;
        referenceNo: string | null;
        eliminationJournalId: number | null;
        approvedBy: number | null;
    }>;
    getBalances(unitId: number, asOfDate?: string): Promise<{
        unitId: number;
        balance: number;
        type: string;
    }[]>;
    generateElimination(year: number, month: number): Promise<{
        id: number;
        journalId: number | null;
        periodYear: number;
        periodMonth: number;
        totalEliminated: import("@prisma/client/runtime/library").Decimal;
        processedDate: Date | null;
        processedBy: number | null;
    }>;
}
