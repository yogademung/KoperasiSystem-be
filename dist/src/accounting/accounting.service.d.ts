import { PrismaService } from '../database/prisma.service';
import { Prisma } from '@prisma/client';
import { ModuleRef } from '@nestjs/core';
export declare class AccountingService {
    private prisma;
    private moduleRef;
    constructor(prisma: PrismaService, moduleRef: ModuleRef);
    getAccounts(type?: string, page?: number, limit?: number): Promise<{
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
    generateNextCode(parentCode: string): Promise<string>;
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
    updateMapping(transType: string, debitAccount: string, creditAccount: string): Promise<{
        updatedAt: Date;
        id: number;
        module: string;
        transType: string;
        description: string;
        debitAccount: string;
        creditAccount: string;
    }>;
    private generateJournalNumber;
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
    getJournalDetail(id: number): Promise<{
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
    autoPostJournal(data: {
        transType: string;
        amount: number;
        description: string;
        userId: number;
        refId?: number;
        wilayahCd?: string;
        branchCode?: string;
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
    deleteJournal(id: number, userId: number, reason: string): Promise<void>;
}
