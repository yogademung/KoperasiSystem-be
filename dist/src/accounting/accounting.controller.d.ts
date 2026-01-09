import { AccountingService } from './accounting.service';
import { Prisma } from '@prisma/client';
export declare class AccountingController {
    private readonly accountingService;
    constructor(accountingService: AccountingService);
    getAccounts(type?: string, page?: string, limit?: string): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getParentAccounts(): Promise<any>;
    getNextCode(parentCode: string): Promise<string>;
    createAccount(data: Prisma.JournalAccountCreateInput): Promise<any>;
    updateAccount(code: string, data: Prisma.JournalAccountUpdateInput): Promise<any>;
    getMappings(module?: string): Promise<any>;
    updateMapping(transType: string, body: {
        debitAccount: string;
        creditAccount: string;
    }): Promise<any>;
    getJournals(startDate?: string, endDate?: string, status?: string, sourceCode?: string, fromAccount?: string, toAccount?: string, page?: string, limit?: string): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getDeletedJournals(startDate?: string, endDate?: string, page?: string, limit?: string): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getJournalDetail(id: string): Promise<any>;
    createManualJournal(req: any, body: {
        date: string;
        description: string;
        details: {
            accountCode: string;
            debit: number;
            credit: number;
            description?: string;
        }[];
    }): Promise<any>;
    updateManualJournal(id: string, body: any, req: any): Promise<any>;
    deleteJournal(id: string, reason: string, req: any): Promise<any>;
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
        journals: any;
    }>;
}
