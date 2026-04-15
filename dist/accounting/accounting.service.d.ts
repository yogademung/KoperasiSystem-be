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
import { ProductConfigService } from '../product-config/product-config.service';
import { AssetService } from './asset/asset.service';
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
    private productConfigService;
    private assetService;
    constructor(prisma: PrismaService, moduleRef: ModuleRef, anggotaService: AnggotaService, tabrelaService: TabrelaService, depositoService: DepositoService, brahmacariService: BrahmacariService, balimesariService: BalimesariService, wanaprastaService: WanaprastaService, periodLockService: PeriodLockService, productConfigService: ProductConfigService, assetService: AssetService);
    getAccounts(type?: string, page?: number, limit?: number): Promise<{
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
    generateNextCode(parentCode: string): Promise<string>;
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
    updateMapping(transType: string, debitAccount: string, creditAccount: string): Promise<{
        id: number;
        updatedAt: Date;
        description: string;
        module: string;
        transType: string;
        debitAccount: string;
        creditAccount: string;
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
    getJournalDetail(id: number): Promise<{
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
    autoPostJournal(data: {
        transType: string;
        amount: number;
        description: string;
        userId: number;
        refId?: number;
        branchCode?: string;
        wilayahCd?: string;
    }, tx?: Prisma.TransactionClient): Promise<{
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
