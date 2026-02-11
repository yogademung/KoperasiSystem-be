import { AccountingService } from './accounting.service';
import { Prisma } from '@prisma/client';
export declare class AccountingController {
    private readonly accountingService;
    constructor(accountingService: AccountingService);
    getAccounts(type?: string, page?: string, limit?: string): Promise<{
        data: {
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            wilayahCd: string | null;
            accountCode: string;
            accountName: string;
            accountType: string;
            parentCode: string | null;
            debetPoleFlag: boolean;
            remark: string | null;
            businessUnitId: number | null;
            isActive: boolean;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getParentAccounts(): Promise<{
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        wilayahCd: string | null;
        accountCode: string;
        accountName: string;
        accountType: string;
        parentCode: string | null;
        debetPoleFlag: boolean;
        remark: string | null;
        businessUnitId: number | null;
        isActive: boolean;
    }[]>;
    getNextCode(parentCode: string): Promise<string>;
    createAccount(data: Prisma.JournalAccountCreateInput): Promise<{
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        wilayahCd: string | null;
        accountCode: string;
        accountName: string;
        accountType: string;
        parentCode: string | null;
        debetPoleFlag: boolean;
        remark: string | null;
        businessUnitId: number | null;
        isActive: boolean;
    }>;
    updateAccount(code: string, data: Prisma.JournalAccountUpdateInput): Promise<{
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        wilayahCd: string | null;
        accountCode: string;
        accountName: string;
        accountType: string;
        parentCode: string | null;
        debetPoleFlag: boolean;
        remark: string | null;
        businessUnitId: number | null;
        isActive: boolean;
    }>;
    getMappings(module?: string): Promise<({
        creditRef: {
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            wilayahCd: string | null;
            accountCode: string;
            accountName: string;
            accountType: string;
            parentCode: string | null;
            debetPoleFlag: boolean;
            remark: string | null;
            businessUnitId: number | null;
            isActive: boolean;
        };
        debitRef: {
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            wilayahCd: string | null;
            accountCode: string;
            accountName: string;
            accountType: string;
            parentCode: string | null;
            debetPoleFlag: boolean;
            remark: string | null;
            businessUnitId: number | null;
            isActive: boolean;
        };
    } & {
        updatedAt: Date;
        id: number;
        description: string;
        transType: string;
        module: string;
        debitAccount: string;
        creditAccount: string;
    })[]>;
    updateMapping(transType: string, body: {
        debitAccount: string;
        creditAccount: string;
    }): Promise<{
        updatedAt: Date;
        id: number;
        description: string;
        transType: string;
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
            status: string;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            id: number;
            journalNumber: string;
            journalDate: Date;
            description: string | null;
            postingType: string;
            transType: string | null;
            refId: number | null;
            tellerId: string | null;
            wilayahCd: string | null;
            sourceCode: string | null;
            userId: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getDeletedJournals(startDate?: string, endDate?: string, page?: string, limit?: string): Promise<{
        data: {
            deletedByName: string | null;
            status: string;
            id: number;
            journalNumber: string;
            journalDate: Date;
            description: string | null;
            postingType: string;
            transType: string | null;
            refId: number | null;
            wilayahCd: string | null;
            sourceCode: string | null;
            userId: number;
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
                createdBy: string | null;
                createdAt: Date;
                updatedBy: string | null;
                updatedAt: Date | null;
                wilayahCd: string | null;
                accountCode: string;
                accountName: string;
                accountType: string;
                parentCode: string | null;
                debetPoleFlag: boolean;
                remark: string | null;
                businessUnitId: number | null;
                isActive: boolean;
            };
        } & {
            id: number;
            description: string | null;
            debit: Prisma.Decimal;
            credit: Prisma.Decimal;
            accountCode: string;
            journalId: number;
        })[];
        status: string;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        id: number;
        journalNumber: string;
        journalDate: Date;
        description: string | null;
        postingType: string;
        transType: string | null;
        refId: number | null;
        tellerId: string | null;
        wilayahCd: string | null;
        sourceCode: string | null;
        userId: number;
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
        status: string;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        id: number;
        journalNumber: string;
        journalDate: Date;
        description: string | null;
        postingType: string;
        transType: string | null;
        refId: number | null;
        tellerId: string | null;
        wilayahCd: string | null;
        sourceCode: string | null;
        userId: number;
    }>;
    updateManualJournal(id: string, body: any, req: any): Promise<{
        status: string;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        id: number;
        journalNumber: string;
        journalDate: Date;
        description: string | null;
        postingType: string;
        transType: string | null;
        refId: number | null;
        tellerId: string | null;
        wilayahCd: string | null;
        sourceCode: string | null;
        userId: number;
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
                debit: Prisma.Decimal;
                credit: Prisma.Decimal;
                accountCode: string;
                journalId: number;
            }[];
        } & {
            status: string;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            id: number;
            journalNumber: string;
            journalDate: Date;
            description: string | null;
            postingType: string;
            transType: string | null;
            refId: number | null;
            tellerId: string | null;
            wilayahCd: string | null;
            sourceCode: string | null;
            userId: number;
        })[];
    }>;
}
