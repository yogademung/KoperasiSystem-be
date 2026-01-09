import { PrismaService } from '../database/prisma.service';
import { Prisma } from '@prisma/client';
import { ModuleRef } from '@nestjs/core';
import { BrahmacariService } from '../simpanan/brahmacari/brahmacari.service';
import { AnggotaService } from '../simpanan/anggota/anggota.service';
import { TabrelaService } from '../simpanan/tabrela/tabrela.service';
import { DepositoService } from '../simpanan/deposito/deposito.service';
import { BalimesariService } from '../simpanan/balimesari/balimesari.service';
import { WanaprastaService } from '../simpanan/wanaprasta/wanaprasta.service';
import { PeriodLockService } from '../month-end/period-lock.service';
export declare class AccountingService {
    private prisma;
    private moduleRef;
    private anggotaService;
    private tabrelaService;
    private depositoService;
    private brahmacariService;
    private balimesariService;
    private wanaprastaService;
    private periodLockService;
    constructor(prisma: PrismaService, moduleRef: ModuleRef, anggotaService: AnggotaService, tabrelaService: TabrelaService, depositoService: DepositoService, brahmacariService: BrahmacariService, balimesariService: BalimesariService, wanaprastaService: WanaprastaService, periodLockService: PeriodLockService);
    getAccounts(type?: string, page?: number, limit?: number): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getParentAccounts(): Promise<any>;
    generateNextCode(parentCode: string): Promise<string>;
    createAccount(data: Prisma.JournalAccountCreateInput): Promise<any>;
    updateAccount(code: string, data: Prisma.JournalAccountUpdateInput): Promise<any>;
    getMappings(module?: string): Promise<any>;
    updateMapping(transType: string, debitAccount: string, creditAccount: string): Promise<any>;
    generateJournalNumber(date?: Date): Promise<string>;
    validateJournalEntry(details: {
        debit: number;
        credit: number;
    }[]): Promise<boolean>;
    getJournals(params: {
        startDate?: Date;
        endDate?: Date;
        status?: string;
        sourceCode?: string;
        fromAccount?: string;
        toAccount?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getJournalDetail(id: number): Promise<any>;
    createManualJournal(data: {
        date: Date;
        description: string;
        userId: number;
        details: {
            accountCode: string;
            debit: number;
            credit: number;
            description?: string;
        }[];
        postingType?: 'MANUAL' | 'AUTO';
    }): Promise<any>;
    updateManualJournal(id: number, data: {
        date: Date;
        description: string;
        userId: number;
        details: {
            accountCode: string;
            debit: number;
            credit: number;
            description?: string;
        }[];
    }): Promise<any>;
    autoPostJournal(data: {
        transType: string;
        amount: number;
        description: string;
        userId: number;
        refId?: number;
        branchCode?: string;
        wilayahCd?: string;
    }, tx?: Prisma.TransactionClient): Promise<any>;
    private getTransactionInfo;
    deleteJournal(id: number, userId: number, reason: string): Promise<any>;
    getDeletedJournals(params: {
        startDate?: Date;
        endDate?: Date;
        page?: number;
        limit?: number;
    }): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getDailyReportData(date: Date): Promise<{
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
