import { AccountingService } from './accounting.service';
import { Prisma } from '@prisma/client';
export declare class AccountingController {
    private readonly accountingService;
    constructor(accountingService: AccountingService);
    getAccounts(type?: string, page?: string, limit?: string): Promise<{
        data: {
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
            updatedAt: Date | null;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getParentAccounts(): Promise<{
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
        updatedAt: Date | null;
    }[]>;
    getNextCode(parentCode: string): Promise<string>;
    createAccount(data: Prisma.JournalAccountCreateInput): Promise<{
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
        updatedAt: Date | null;
    }>;
    updateAccount(code: string, data: Prisma.JournalAccountUpdateInput): Promise<{
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
        updatedAt: Date | null;
    }>;
    getMappings(module?: string): Promise<({
        debitRef: {
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
            updatedAt: Date | null;
        };
        creditRef: {
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
            updatedAt: Date | null;
        };
    } & {
        updatedAt: Date;
        id: number;
        module: string;
        transType: string;
        description: string;
        debitAccount: string;
        creditAccount: string;
    })[]>;
    updateMapping(transType: string, body: {
        debitAccount: string;
        creditAccount: string;
    }): Promise<{
        updatedAt: Date;
        id: number;
        module: string;
        transType: string;
        description: string;
        debitAccount: string;
        creditAccount: string;
    }>;
    getJournals(startDate?: string, endDate?: string, status?: string, sourceCode?: string, fromAccount?: string, toAccount?: string, page?: string, limit?: string): Promise<{
        data: ({
            user: {
                fullName: string;
            };
        } & {
            wilayahCd: string | null;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            id: number;
            transType: string | null;
            description: string | null;
            status: string;
            userId: number;
            journalNumber: string;
            journalDate: Date;
            postingType: string;
            sourceCode: string | null;
            refId: number | null;
            tellerId: string | null;
        })[];
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
                updatedAt: Date | null;
            };
        } & {
            accountCode: string;
            id: number;
            description: string | null;
            debit: Prisma.Decimal;
            credit: Prisma.Decimal;
            journalId: number;
        })[];
    } & {
        wilayahCd: string | null;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        id: number;
        transType: string | null;
        description: string | null;
        status: string;
        userId: number;
        journalNumber: string;
        journalDate: Date;
        postingType: string;
        sourceCode: string | null;
        refId: number | null;
        tellerId: string | null;
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
        wilayahCd: string | null;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        id: number;
        transType: string | null;
        description: string | null;
        status: string;
        userId: number;
        journalNumber: string;
        journalDate: Date;
        postingType: string;
        sourceCode: string | null;
        refId: number | null;
        tellerId: string | null;
    }>;
    updateManualJournal(id: string, body: any, req: any): Promise<{
        wilayahCd: string | null;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        id: number;
        transType: string | null;
        description: string | null;
        status: string;
        userId: number;
        journalNumber: string;
        journalDate: Date;
        postingType: string;
        sourceCode: string | null;
        refId: number | null;
        tellerId: string | null;
    }>;
    deleteJournal(id: string, reason: string, req: any): Promise<void>;
}
