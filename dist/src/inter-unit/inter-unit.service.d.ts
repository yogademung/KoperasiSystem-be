import { PrismaService } from '../database/prisma.service';
import { Prisma, InterUnitTransactionStatus, InterUnitTransactionType } from '@prisma/client';
import { AccountingService } from '../accounting/accounting.service';
export interface CreateInterUnitTransactionDto {
    transactionDate: Date;
    sourceUnitId: number;
    destUnitId: number;
    amount: number;
    description?: string;
    transactionType: InterUnitTransactionType;
}
export interface InterUnitTransactionFilters {
    startDate?: Date;
    endDate?: Date;
    sourceUnitId?: number;
    destUnitId?: number;
    status?: InterUnitTransactionStatus;
    page?: number;
    limit?: number;
}
export declare class InterUnitService {
    private prisma;
    private accountingService;
    constructor(prisma: PrismaService, accountingService: AccountingService);
    generateReferenceNumber(date?: Date): Promise<string>;
    create(dto: CreateInterUnitTransactionDto, userId: number): Promise<{
        creator: {
            fullName: string;
        };
    } & {
        id: number;
        description: string | null;
        createdBy: number;
        createdAt: Date;
        status: import(".prisma/client").$Enums.InterUnitTransactionStatus;
        amount: Prisma.Decimal;
        journalId: number | null;
        approvedBy: number | null;
        transactionDate: Date;
        sourceUnitId: number;
        destUnitId: number;
        transactionType: import(".prisma/client").$Enums.InterUnitTransactionType;
        referenceNo: string | null;
        eliminationJournalId: number | null;
    }>;
    findAll(filters: InterUnitTransactionFilters): Promise<{
        data: ({
            creator: {
                fullName: string;
            };
            approver: {
                fullName: string;
            } | null;
        } & {
            id: number;
            description: string | null;
            createdBy: number;
            createdAt: Date;
            status: import(".prisma/client").$Enums.InterUnitTransactionStatus;
            amount: Prisma.Decimal;
            journalId: number | null;
            approvedBy: number | null;
            transactionDate: Date;
            sourceUnitId: number;
            destUnitId: number;
            transactionType: import(".prisma/client").$Enums.InterUnitTransactionType;
            referenceNo: string | null;
            eliminationJournalId: number | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: number): Promise<{
        creator: {
            username: string;
            fullName: string;
        };
        approver: {
            username: string;
            fullName: string;
        } | null;
    } & {
        id: number;
        description: string | null;
        createdBy: number;
        createdAt: Date;
        status: import(".prisma/client").$Enums.InterUnitTransactionStatus;
        amount: Prisma.Decimal;
        journalId: number | null;
        approvedBy: number | null;
        transactionDate: Date;
        sourceUnitId: number;
        destUnitId: number;
        transactionType: import(".prisma/client").$Enums.InterUnitTransactionType;
        referenceNo: string | null;
        eliminationJournalId: number | null;
    }>;
    approve(id: number, userId: number): Promise<{
        id: number;
        description: string | null;
        createdBy: number;
        createdAt: Date;
        status: import(".prisma/client").$Enums.InterUnitTransactionStatus;
        amount: Prisma.Decimal;
        journalId: number | null;
        approvedBy: number | null;
        transactionDate: Date;
        sourceUnitId: number;
        destUnitId: number;
        transactionType: import(".prisma/client").$Enums.InterUnitTransactionType;
        referenceNo: string | null;
        eliminationJournalId: number | null;
    }>;
    post(id: number, userId: number): Promise<{
        id: number;
        description: string | null;
        createdBy: number;
        createdAt: Date;
        status: import(".prisma/client").$Enums.InterUnitTransactionStatus;
        amount: Prisma.Decimal;
        journalId: number | null;
        approvedBy: number | null;
        transactionDate: Date;
        sourceUnitId: number;
        destUnitId: number;
        transactionType: import(".prisma/client").$Enums.InterUnitTransactionType;
        referenceNo: string | null;
        eliminationJournalId: number | null;
    }>;
    getBalances(unitId: number, asOfDate?: Date): Promise<{
        unitId: number;
        balance: number;
        type: string;
    }[]>;
    generateElimination(year: number, month: number, userId: number): Promise<{
        id: number;
        journalId: number | null;
        periodYear: number;
        periodMonth: number;
        totalEliminated: Prisma.Decimal;
        processedDate: Date | null;
        processedBy: number | null;
    }>;
    delete(id: number): Promise<{
        id: number;
        description: string | null;
        createdBy: number;
        createdAt: Date;
        status: import(".prisma/client").$Enums.InterUnitTransactionStatus;
        amount: Prisma.Decimal;
        journalId: number | null;
        approvedBy: number | null;
        transactionDate: Date;
        sourceUnitId: number;
        destUnitId: number;
        transactionType: import(".prisma/client").$Enums.InterUnitTransactionType;
        referenceNo: string | null;
        eliminationJournalId: number | null;
    }>;
}
