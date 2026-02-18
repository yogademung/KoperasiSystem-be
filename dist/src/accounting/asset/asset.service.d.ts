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
            id: number;
            updatedAt: Date | null;
            name: string;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            code: string;
            status: string;
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
        };
        journal: {
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
            refId: number | null;
            tellerId: string | null;
            sourceCode: string | null;
        };
    }>;
    findAll(page?: number, limit?: number): Promise<{
        data: {
            id: number;
            updatedAt: Date | null;
            name: string;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            code: string;
            status: string;
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
                refId: number | null;
                tellerId: string | null;
                sourceCode: string | null;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            period: string;
            amount: Prisma.Decimal;
            journalId: number | null;
            assetId: number;
        })[];
    } & {
        id: number;
        updatedAt: Date | null;
        name: string;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        code: string;
        status: string;
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
    }>;
    update(id: number, data: any): Promise<{
        id: number;
        updatedAt: Date | null;
        name: string;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        code: string;
        status: string;
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
    }>;
    remove(id: number): Promise<{
        id: number;
        updatedAt: Date | null;
        name: string;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        code: string;
        status: string;
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
        id: number;
        updatedAt: Date | null;
        name: string;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        code: string;
        status: string;
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
    }>;
    payAssetPurchase(dto: {
        assetId: number;
        paymentAccountId: string;
        amount: number;
        date?: Date;
        userId: number;
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
        refId: number | null;
        tellerId: string | null;
        sourceCode: string | null;
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
            refId: number | null;
            tellerId: string | null;
            sourceCode: string | null;
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
