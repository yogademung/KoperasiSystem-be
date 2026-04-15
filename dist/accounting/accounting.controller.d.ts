import { AccountingService } from './accounting.service';
import { Prisma } from '@prisma/client';
export declare class AccountingController {
    private readonly accountingService;
    constructor(accountingService: AccountingService);
    getAccounts(type?: string, page?: string, limit?: string): Promise<{
        data: {
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            remark: string | null;
            accountCode: string;
            wilayahCd: string | null;
            accountName: string;
            accountType: string;
            parentCode: string | null;
            debetPoleFlag: boolean;
            businessUnitId: number | null;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getParentAccounts(): Promise<{
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        remark: string | null;
        accountCode: string;
        wilayahCd: string | null;
        accountName: string;
        accountType: string;
        parentCode: string | null;
        debetPoleFlag: boolean;
        businessUnitId: number | null;
    }[]>;
    getNextCode(parentCode: string): Promise<string>;
    createAccount(data: Prisma.JournalAccountCreateInput): Promise<{
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        remark: string | null;
        accountCode: string;
        wilayahCd: string | null;
        accountName: string;
        accountType: string;
        parentCode: string | null;
        debetPoleFlag: boolean;
        businessUnitId: number | null;
    }>;
    updateAccount(code: string, data: Prisma.JournalAccountUpdateInput): Promise<{
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        remark: string | null;
        accountCode: string;
        wilayahCd: string | null;
        accountName: string;
        accountType: string;
        parentCode: string | null;
        debetPoleFlag: boolean;
        businessUnitId: number | null;
    }>;
    getMappings(module?: string): Promise<({
        creditRef: {
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            remark: string | null;
            accountCode: string;
            wilayahCd: string | null;
            accountName: string;
            accountType: string;
            parentCode: string | null;
            debetPoleFlag: boolean;
            businessUnitId: number | null;
        };
        debitRef: {
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            remark: string | null;
            accountCode: string;
            wilayahCd: string | null;
            accountName: string;
            accountType: string;
            parentCode: string | null;
            debetPoleFlag: boolean;
            businessUnitId: number | null;
        };
    } & {
        id: number;
        updatedAt: Date;
        description: string;
        module: string;
        transType: string;
        debitAccount: string;
        creditAccount: string;
    })[]>;
    updateMapping(transType: string, body: {
        debitAccount: string;
        creditAccount: string;
    }): Promise<{
        id: number;
        updatedAt: Date;
        description: string;
        module: string;
        transType: string;
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
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            description: string | null;
            status: string;
            transType: string | null;
            userId: number;
            journalNumber: string;
            journalDate: Date;
            postingType: string;
            refId: number | null;
            tellerId: string | null;
            wilayahCd: string | null;
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
            status: string;
            transType: string | null;
            userId: number;
            journalNumber: string;
            journalDate: Date;
            postingType: string;
            refId: number | null;
            wilayahCd: string | null;
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
                isActive: boolean;
                createdBy: string | null;
                createdAt: Date;
                updatedBy: string | null;
                updatedAt: Date | null;
                remark: string | null;
                accountCode: string;
                wilayahCd: string | null;
                accountName: string;
                accountType: string;
                parentCode: string | null;
                debetPoleFlag: boolean;
                businessUnitId: number | null;
            };
        } & {
            id: number;
            description: string | null;
            journalId: number;
            accountCode: string;
            debit: Prisma.Decimal;
            credit: Prisma.Decimal;
        })[];
        id: number;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        description: string | null;
        status: string;
        transType: string | null;
        userId: number;
        journalNumber: string;
        journalDate: Date;
        postingType: string;
        refId: number | null;
        tellerId: string | null;
        wilayahCd: string | null;
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
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        description: string | null;
        status: string;
        transType: string | null;
        userId: number;
        journalNumber: string;
        journalDate: Date;
        postingType: string;
        refId: number | null;
        tellerId: string | null;
        wilayahCd: string | null;
        sourceCode: string | null;
    }>;
    updateManualJournal(id: string, body: any, req: any): Promise<{
        id: number;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        description: string | null;
        status: string;
        transType: string | null;
        userId: number;
        journalNumber: string;
        journalDate: Date;
        postingType: string;
        refId: number | null;
        tellerId: string | null;
        wilayahCd: string | null;
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
                journalId: number;
                accountCode: string;
                debit: Prisma.Decimal;
                credit: Prisma.Decimal;
            }[];
        } & {
            id: number;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            description: string | null;
            status: string;
            transType: string | null;
            userId: number;
            journalNumber: string;
            journalDate: Date;
            postingType: string;
            refId: number | null;
            tellerId: string | null;
            wilayahCd: string | null;
            sourceCode: string | null;
        })[];
    }>;
}
