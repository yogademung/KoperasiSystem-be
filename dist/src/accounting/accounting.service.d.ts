import { PrismaService } from '../database/prisma.service';
import { Prisma } from '@prisma/client';
import { ModuleRef } from '@nestjs/core';
import { BrahmacariService } from '../simpanan/brahmacari/brahmacari.service';
import { AnggotaService } from '../simpanan/anggota/anggota.service';
import { TabrelaService } from '../simpanan/tabrela/tabrela.service';
import { DepositoService } from '../simpanan/deposito/deposito.service';
import { BalimesariService } from '../simpanan/balimesari/balimesari.service';
import { WanaprastaService } from '../simpanan/wanaprasta/wanaprasta.service';
export declare class AccountingService {
    private prisma;
    private moduleRef;
    private anggotaService;
    private tabrelaService;
    private depositoService;
    private brahmacariService;
    private balimesariService;
    private wanaprastaService;
    constructor(prisma: PrismaService, moduleRef: ModuleRef, anggotaService: AnggotaService, tabrelaService: TabrelaService, depositoService: DepositoService, brahmacariService: BrahmacariService, balimesariService: BalimesariService, wanaprastaService: WanaprastaService);
    getAccounts(type?: string, page?: number, limit?: number): Promise<{
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
    generateNextCode(parentCode: string): Promise<string>;
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
    } & {
        id: number;
        transType: string;
        module: string;
        description: string;
        debitAccount: string;
        creditAccount: string;
        updatedAt: Date;
    })[]>;
    updateMapping(transType: string, debitAccount: string, creditAccount: string): Promise<{
        id: number;
        transType: string;
        module: string;
        description: string;
        debitAccount: string;
        creditAccount: string;
        updatedAt: Date;
    }>;
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
    getJournalDetail(id: number): Promise<{
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
            debit: Prisma.Decimal;
            credit: Prisma.Decimal;
            journalId: number;
        })[];
    } & {
        id: number;
        transType: string | null;
        description: string | null;
        updatedAt: Date | null;
        wilayahCd: string | null;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        status: string;
        userId: number;
        journalNumber: string;
        journalDate: Date;
        postingType: string;
        sourceCode: string | null;
        refId: number | null;
        tellerId: string | null;
    }>;
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
    }): Promise<{
        id: number;
        transType: string | null;
        description: string | null;
        updatedAt: Date | null;
        wilayahCd: string | null;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        status: string;
        userId: number;
        journalNumber: string;
        journalDate: Date;
        postingType: string;
        sourceCode: string | null;
        refId: number | null;
        tellerId: string | null;
    }>;
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
    }): Promise<{
        id: number;
        transType: string | null;
        description: string | null;
        updatedAt: Date | null;
        wilayahCd: string | null;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        status: string;
        userId: number;
        journalNumber: string;
        journalDate: Date;
        postingType: string;
        sourceCode: string | null;
        refId: number | null;
        tellerId: string | null;
    }>;
    autoPostJournal(data: {
        transType: string;
        amount: number;
        description: string;
        userId: number;
        refId?: number;
        wilayahCd?: string;
        branchCode?: string;
    }): Promise<{
        id: number;
        transType: string | null;
        description: string | null;
        updatedAt: Date | null;
        wilayahCd: string | null;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        status: string;
        userId: number;
        journalNumber: string;
        journalDate: Date;
        postingType: string;
        sourceCode: string | null;
        refId: number | null;
        tellerId: string | null;
    }>;
    private getTransactionInfo;
    deleteJournal(id: number, userId: number, reason: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getDeletedJournals(params: {
        startDate?: Date;
        endDate?: Date;
        page?: number;
        limit?: number;
    }): Promise<{
        data: {
            deletedByName: string | null;
            id: number;
            transType: string | null;
            description: string | null;
            wilayahCd: string | null;
            status: string;
            userId: number;
            journalNumber: string;
            journalDate: Date;
            postingType: string;
            sourceCode: string | null;
            refId: number | null;
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
        journals: ({
            details: {
                id: number;
                description: string | null;
                accountCode: string;
                debit: Prisma.Decimal;
                credit: Prisma.Decimal;
                journalId: number;
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
            status: string;
            userId: number;
            journalNumber: string;
            journalDate: Date;
            postingType: string;
            sourceCode: string | null;
            refId: number | null;
            tellerId: string | null;
        })[];
    }>;
}
