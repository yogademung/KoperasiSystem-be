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
    generateNextCode(parentCode: string): Promise<string>;
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
    updateMapping(transType: string, debitAccount: string, creditAccount: string): Promise<{
        updatedAt: Date;
        id: number;
        description: string;
        transType: string;
        module: string;
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
    getJournalDetail(id: number): Promise<{
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
    autoPostJournal(data: {
        transType: string;
        amount: number;
        description: string;
        userId: number;
        refId?: number;
        branchCode?: string;
        wilayahCd?: string;
    }, tx?: Prisma.TransactionClient): Promise<{
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
