import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';
import { AccountingService } from '../accounting.service';
import { PeriodLockService } from '../../month-end/period-lock.service';
export declare class AssetService {
    private prisma;
    private accountingService;
    private periodLockService;
    constructor(prisma: PrismaService, accountingService: AccountingService, periodLockService: PeriodLockService);
    create(createAssetDto: any, userId: number): Promise<{
        asset: {
            name: string;
            code: string;
            type: string;
            acquisitionDate: Date;
            acquisitionCost: Prisma.Decimal;
            residualValue: Prisma.Decimal;
            usefulLifeYears: number;
            depreciationRate: number;
            depreciationMethod: string;
            assetAccountId: string;
            accumDepreciationAccountId: string;
            expenseAccountId: string;
            status: string;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            id: number;
        };
        journal: {
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
        };
    }>;
    findAll(page?: number, limit?: number): Promise<{
        data: {
            name: string;
            code: string;
            type: string;
            acquisitionDate: Date;
            acquisitionCost: Prisma.Decimal;
            residualValue: Prisma.Decimal;
            usefulLifeYears: number;
            depreciationRate: number;
            depreciationMethod: string;
            assetAccountId: string;
            accumDepreciationAccountId: string;
            expenseAccountId: string;
            status: string;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            id: number;
        }[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
    }>;
    generateAssetCode(dateStr: string, tx?: Prisma.TransactionClient): Promise<string>;
    findOne(id: number): Promise<{
        depreciationHistory: ({
            journal: {
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
            } | null;
        } & {
            createdAt: Date;
            id: number;
            period: string;
            assetId: number;
            amount: Prisma.Decimal;
            journalId: number | null;
        })[];
    } & {
        name: string;
        code: string;
        type: string;
        acquisitionDate: Date;
        acquisitionCost: Prisma.Decimal;
        residualValue: Prisma.Decimal;
        usefulLifeYears: number;
        depreciationRate: number;
        depreciationMethod: string;
        assetAccountId: string;
        accumDepreciationAccountId: string;
        expenseAccountId: string;
        status: string;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        id: number;
    }>;
    update(id: number, data: any): Promise<{
        name: string;
        code: string;
        type: string;
        acquisitionDate: Date;
        acquisitionCost: Prisma.Decimal;
        residualValue: Prisma.Decimal;
        usefulLifeYears: number;
        depreciationRate: number;
        depreciationMethod: string;
        assetAccountId: string;
        accumDepreciationAccountId: string;
        expenseAccountId: string;
        status: string;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        id: number;
    }>;
    remove(id: number): Promise<{
        name: string;
        code: string;
        type: string;
        acquisitionDate: Date;
        acquisitionCost: Prisma.Decimal;
        residualValue: Prisma.Decimal;
        usefulLifeYears: number;
        depreciationRate: number;
        depreciationMethod: string;
        assetAccountId: string;
        accumDepreciationAccountId: string;
        expenseAccountId: string;
        status: string;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        id: number;
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
    voidTransaction(assetId: number, tx: Prisma.TransactionClient): Promise<{
        name: string;
        code: string;
        type: string;
        acquisitionDate: Date;
        acquisitionCost: Prisma.Decimal;
        residualValue: Prisma.Decimal;
        usefulLifeYears: number;
        depreciationRate: number;
        depreciationMethod: string;
        assetAccountId: string;
        accumDepreciationAccountId: string;
        expenseAccountId: string;
        status: string;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        id: number;
    }>;
    payAssetPurchase(dto: {
        assetId: number;
        paymentAccountId: string;
        amount: number;
        date?: Date;
        userId: number;
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
    disposeAsset(dto: {
        assetId: number;
        saleAmount: number;
        paymentAccountId: string;
        gainLossAccountId?: string;
        date?: Date;
        userId: number;
    }): Promise<{
        journal: {
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
        };
        gainLoss: number;
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
