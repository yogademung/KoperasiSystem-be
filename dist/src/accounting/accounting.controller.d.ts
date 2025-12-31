import { AccountingService } from './accounting.service';
import { Prisma } from '@prisma/client';
export declare class AccountingController {
    private readonly accountingService;
    constructor(accountingService: AccountingService);
    getAccounts(type?: string, page?: string, limit?: string): Promise<{
        data: {
            accountCode: string;
            wilayahCd: string | null;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            accountName: string;
            accountType: string;
            parentCode: string | null;
            debetPoleFlag: boolean;
            remark: string | null;
            isActive: boolean;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getParentAccounts(): Promise<{
        accountCode: string;
        wilayahCd: string | null;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        accountName: string;
        accountType: string;
        parentCode: string | null;
        debetPoleFlag: boolean;
        remark: string | null;
        isActive: boolean;
    }[]>;
    getNextCode(parentCode: string): Promise<string>;
    createAccount(data: Prisma.JournalAccountCreateInput): Promise<{
        accountCode: string;
        wilayahCd: string | null;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        accountName: string;
        accountType: string;
        parentCode: string | null;
        debetPoleFlag: boolean;
        remark: string | null;
        isActive: boolean;
    }>;
    updateAccount(code: string, data: Prisma.JournalAccountUpdateInput): Promise<{
        accountCode: string;
        wilayahCd: string | null;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        accountName: string;
        accountType: string;
        parentCode: string | null;
        debetPoleFlag: boolean;
        remark: string | null;
        isActive: boolean;
    }>;
    getMappings(module?: string): Promise<({
        debitRef: {
            accountCode: string;
            wilayahCd: string | null;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            accountName: string;
            accountType: string;
            parentCode: string | null;
            debetPoleFlag: boolean;
            remark: string | null;
            isActive: boolean;
        };
        creditRef: {
            accountCode: string;
            wilayahCd: string | null;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            accountName: string;
            accountType: string;
            parentCode: string | null;
            debetPoleFlag: boolean;
            remark: string | null;
            isActive: boolean;
        };
    } & {
        id: number;
        description: string;
        transType: string;
        updatedAt: Date;
        module: string;
        debitAccount: string;
        creditAccount: string;
    })[]>;
    updateMapping(transType: string, body: {
        debitAccount: string;
        creditAccount: string;
    }): Promise<{
        id: number;
        description: string;
        transType: string;
        updatedAt: Date;
        module: string;
        debitAccount: string;
        creditAccount: string;
    }>;
    getJournals(startDate?: string, endDate?: string, status?: string, sourceCode?: string, fromAccount?: string, toAccount?: string, page?: string, limit?: string): Promise<{
        data: ({
            user: {
                fullName: string;
            };
        } & {
            id: number;
            description: string | null;
            journalNumber: string;
            journalDate: Date;
            postingType: string;
            transType: string | null;
            refId: number | null;
            userId: number;
            tellerId: string | null;
            wilayahCd: string | null;
            status: string;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
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
            description: string | null;
            journalNumber: string;
            journalDate: Date;
            postingType: string;
            transType: string | null;
            refId: number | null;
            userId: number;
            wilayahCd: string | null;
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
        user: {
            fullName: string;
        };
        details: ({
            account: {
                accountCode: string;
                wilayahCd: string | null;
                createdBy: string | null;
                createdAt: Date;
                updatedBy: string | null;
                updatedAt: Date | null;
                accountName: string;
                accountType: string;
                parentCode: string | null;
                debetPoleFlag: boolean;
                remark: string | null;
                isActive: boolean;
            };
        } & {
            id: number;
            journalId: number;
            accountCode: string;
            debit: Prisma.Decimal;
            credit: Prisma.Decimal;
            description: string | null;
        })[];
    } & {
        id: number;
        description: string | null;
        journalNumber: string;
        journalDate: Date;
        postingType: string;
        transType: string | null;
        refId: number | null;
        userId: number;
        tellerId: string | null;
        wilayahCd: string | null;
        status: string;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
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
        description: string | null;
        journalNumber: string;
        journalDate: Date;
        postingType: string;
        transType: string | null;
        refId: number | null;
        userId: number;
        tellerId: string | null;
        wilayahCd: string | null;
        status: string;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        sourceCode: string | null;
    }>;
    updateManualJournal(id: string, body: any, req: any): Promise<{
        id: number;
        description: string | null;
        journalNumber: string;
        journalDate: Date;
        postingType: string;
        transType: string | null;
        refId: number | null;
        userId: number;
        tellerId: string | null;
        wilayahCd: string | null;
        status: string;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
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
                journalId: number;
                accountCode: string;
                debit: Prisma.Decimal;
                credit: Prisma.Decimal;
                description: string | null;
            }[];
        } & {
            id: number;
            description: string | null;
            journalNumber: string;
            journalDate: Date;
            postingType: string;
            transType: string | null;
            refId: number | null;
            userId: number;
            tellerId: string | null;
            wilayahCd: string | null;
            status: string;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            sourceCode: string | null;
        })[];
    }>;
}
