import { AccountingService } from './accounting.service';
import { Prisma } from '@prisma/client';
export declare class AccountingController {
    private readonly accountingService;
    constructor(accountingService: AccountingService);
    getAccounts(type?: string, page?: string, limit?: string): Promise<{
        data: {
            updatedAt: Date | null;
            accountCode: string;
            accountName: string;
            accountType: string;
            parentCode: string | null;
            debetPoleFlag: boolean;
            remark: string | null;
            wilayahCd: string | null;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getParentAccounts(): Promise<{
        updatedAt: Date | null;
        accountCode: string;
        accountName: string;
        accountType: string;
        parentCode: string | null;
        debetPoleFlag: boolean;
        remark: string | null;
        wilayahCd: string | null;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
    }[]>;
    getNextCode(parentCode: string): Promise<string>;
    createAccount(data: Prisma.JournalAccountCreateInput): Promise<{
        updatedAt: Date | null;
        accountCode: string;
        accountName: string;
        accountType: string;
        parentCode: string | null;
        debetPoleFlag: boolean;
        remark: string | null;
        wilayahCd: string | null;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
    }>;
    updateAccount(code: string, data: Prisma.JournalAccountUpdateInput): Promise<{
        updatedAt: Date | null;
        accountCode: string;
        accountName: string;
        accountType: string;
        parentCode: string | null;
        debetPoleFlag: boolean;
        remark: string | null;
        wilayahCd: string | null;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
    }>;
    getMappings(module?: string): Promise<({
        creditRef: {
            updatedAt: Date | null;
            accountCode: string;
            accountName: string;
            accountType: string;
            parentCode: string | null;
            debetPoleFlag: boolean;
            remark: string | null;
            wilayahCd: string | null;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
        };
        debitRef: {
            updatedAt: Date | null;
            accountCode: string;
            accountName: string;
            accountType: string;
            parentCode: string | null;
            debetPoleFlag: boolean;
            remark: string | null;
            wilayahCd: string | null;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
        };
    } & {
        id: number;
        transType: string;
        module: string;
        description: string;
        debitAccount: string;
        creditAccount: string;
        updatedAt: Date;
    })[]>;
    updateMapping(transType: string, body: {
        debitAccount: string;
        creditAccount: string;
    }): Promise<{
        id: number;
        transType: string;
        module: string;
        description: string;
        debitAccount: string;
        creditAccount: string;
        updatedAt: Date;
    }>;
    getJournals(startDate?: string, endDate?: string, status?: string, sourceCode?: string, fromAccount?: string, toAccount?: string, page?: string, limit?: string): Promise<{
        data: ({
            user: {
                fullName: string;
            };
        } & {
            id: number;
            transType: string | null;
            description: string | null;
            updatedAt: Date | null;
            wilayahCd: string | null;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            journalNumber: string;
            journalDate: Date;
            postingType: string;
            refId: number | null;
            userId: number;
            tellerId: string | null;
            status: string;
            sourceCode: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getDeletedJournals(startDate?: string, endDate?: string, page?: string, limit?: string): Promise<{
        data: {
            deletedByName: string | null;
            id: number;
            transType: string | null;
            description: string | null;
            wilayahCd: string | null;
            journalNumber: string;
            journalDate: Date;
            postingType: string;
            refId: number | null;
            userId: number;
            status: string;
            sourceCode: string | null;
            originalId: number;
            deletedBy: string | null;
            deletedAt: Date;
            deleteReason: string | null;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getJournalDetail(id: string): Promise<{
        isLocked: boolean;
        user: {
            fullName: string;
        };
        details: ({
            account: {
                updatedAt: Date | null;
                accountCode: string;
                accountName: string;
                accountType: string;
                parentCode: string | null;
                debetPoleFlag: boolean;
                remark: string | null;
                wilayahCd: string | null;
                isActive: boolean;
                createdBy: string | null;
                createdAt: Date;
                updatedBy: string | null;
            };
        } & {
            id: number;
            description: string | null;
            accountCode: string;
            journalId: number;
            debit: Prisma.Decimal;
            credit: Prisma.Decimal;
        })[];
        id: number;
        transType: string | null;
        description: string | null;
        updatedAt: Date | null;
        wilayahCd: string | null;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        journalNumber: string;
        journalDate: Date;
        postingType: string;
        refId: number | null;
        userId: number;
        tellerId: string | null;
        status: string;
        sourceCode: string | null;
    }>;
    createManualJournal(req: any, body: {
        date: string;
        description: string;
        details: {
            accountCode: string;
            debit: number;
            credit: number;
            description?: string;
        }[];
    }): Promise<{
        id: number;
        transType: string | null;
        description: string | null;
        updatedAt: Date | null;
        wilayahCd: string | null;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        journalNumber: string;
        journalDate: Date;
        postingType: string;
        refId: number | null;
        userId: number;
        tellerId: string | null;
        status: string;
        sourceCode: string | null;
    }>;
    updateManualJournal(id: string, body: any, req: any): Promise<{
        id: number;
        transType: string | null;
        description: string | null;
        updatedAt: Date | null;
        wilayahCd: string | null;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        journalNumber: string;
        journalDate: Date;
        postingType: string;
        refId: number | null;
        userId: number;
        tellerId: string | null;
        status: string;
        sourceCode: string | null;
    }>;
    deleteJournal(id: string, reason: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getDailyReport(date?: string): Promise<{
        date: Date;
        summary: {
            product: string;
            depositTotal: number;
            withdrawalTotal: number;
            depositCount: number;
            withdrawalCount: number;
        }[];
        interestEstimates: {
            product: string;
            totalBalance: number;
            avgRate: number;
            estimatedDailyInterest: number;
        }[];
        journals: ({
            details: {
                id: number;
                description: string | null;
                accountCode: string;
                journalId: number;
                debit: Prisma.Decimal;
                credit: Prisma.Decimal;
            }[];
        } & {
            id: number;
            transType: string | null;
            description: string | null;
            updatedAt: Date | null;
            wilayahCd: string | null;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            journalNumber: string;
            journalDate: Date;
            postingType: string;
            refId: number | null;
            userId: number;
            tellerId: string | null;
            status: string;
            sourceCode: string | null;
        })[];
    }>;
}
