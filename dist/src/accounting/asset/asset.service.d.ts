import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';
import { AccountingService } from '../accounting.service';
export declare class AssetService {
    private prisma;
    private accountingService;
    constructor(prisma: PrismaService, accountingService: AccountingService);
    create(createAssetDto: any, userId: number): Promise<{
        asset: {
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            name: string;
            id: number;
            status: string;
            type: string;
            code: string;
            acquisitionDate: Date;
            acquisitionCost: Prisma.Decimal;
            residualValue: Prisma.Decimal;
            usefulLifeYears: number;
            depreciationRate: number;
            depreciationMethod: string;
            assetAccountId: string;
            accumDepreciationAccountId: string;
            expenseAccountId: string;
        };
        journal: {
            wilayahCd: string | null;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            transType: string | null;
            description: string | null;
            id: number;
            journalNumber: string;
            journalDate: Date;
            postingType: string;
            refId: number | null;
            userId: number;
            tellerId: string | null;
            status: string;
            sourceCode: string | null;
        };
    }>;
    findAll(page?: number, limit?: number): Promise<{
        data: {
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            name: string;
            id: number;
            status: string;
            type: string;
            code: string;
            acquisitionDate: Date;
            acquisitionCost: Prisma.Decimal;
            residualValue: Prisma.Decimal;
            usefulLifeYears: number;
            depreciationRate: number;
            depreciationMethod: string;
            assetAccountId: string;
            accumDepreciationAccountId: string;
            expenseAccountId: string;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: number): Promise<{
        depreciationHistory: ({
            journal: {
                wilayahCd: string | null;
                createdBy: string | null;
                createdAt: Date;
                updatedBy: string | null;
                updatedAt: Date | null;
                transType: string | null;
                description: string | null;
                id: number;
                journalNumber: string;
                journalDate: Date;
                postingType: string;
                refId: number | null;
                userId: number;
                tellerId: string | null;
                status: string;
                sourceCode: string | null;
            } | null;
        } & {
            createdAt: Date;
            id: number;
            journalId: number | null;
            amount: Prisma.Decimal;
            period: string;
            assetId: number;
        })[];
    } & {
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        name: string;
        id: number;
        status: string;
        type: string;
        code: string;
        acquisitionDate: Date;
        acquisitionCost: Prisma.Decimal;
        residualValue: Prisma.Decimal;
        usefulLifeYears: number;
        depreciationRate: number;
        depreciationMethod: string;
        assetAccountId: string;
        accumDepreciationAccountId: string;
        expenseAccountId: string;
    }>;
    update(id: number, data: any): Promise<{
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        name: string;
        id: number;
        status: string;
        type: string;
        code: string;
        acquisitionDate: Date;
        acquisitionCost: Prisma.Decimal;
        residualValue: Prisma.Decimal;
        usefulLifeYears: number;
        depreciationRate: number;
        depreciationMethod: string;
        assetAccountId: string;
        accumDepreciationAccountId: string;
        expenseAccountId: string;
    }>;
    remove(id: number): Promise<{
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        name: string;
        id: number;
        status: string;
        type: string;
        code: string;
        acquisitionDate: Date;
        acquisitionCost: Prisma.Decimal;
        residualValue: Prisma.Decimal;
        usefulLifeYears: number;
        depreciationRate: number;
        depreciationMethod: string;
        assetAccountId: string;
        accumDepreciationAccountId: string;
        expenseAccountId: string;
    }>;
    calculateMonthlyDepreciation(assetId: number, date: Date): Promise<number>;
    runDepreciationProcess(userId: number, date: Date): Promise<{
        journalId: number;
        processedCount: number;
        totalAmount: number;
    } | {
        message: string;
        processedCount: number;
    }>;
    getBalanceSheet(date: Date): Promise<{
        date: Date;
        totalAcquisition: Prisma.Decimal;
        totalBookValue: Prisma.Decimal;
        details: {
            id: number;
            code: string;
            name: string;
            type: string;
            acquisitionCost: Prisma.Decimal;
            accumulatedDepreciation: Prisma.Decimal;
            bookValue: Prisma.Decimal;
        }[];
    }>;
    getAssetMutations(startDate: Date, endDate: Date): Promise<{
        startDate: Date;
        endDate: Date;
        acquisitions: {
            type: string;
            date: Date;
            asset: string;
            amount: Prisma.Decimal;
        }[];
        depreciations: {
            type: string;
            period: string;
            asset: string;
            amount: Prisma.Decimal;
        }[];
    }>;
}
