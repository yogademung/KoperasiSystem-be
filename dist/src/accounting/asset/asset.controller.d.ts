import { AssetService } from './asset.service';
export declare class AssetController {
    private readonly assetService;
    constructor(assetService: AssetService);
    create(user: any, createAssetDto: any): Promise<{
        asset: {
            name: string;
            code: string;
            type: string;
            acquisitionDate: Date;
            acquisitionCost: import("@prisma/client/runtime/library").Decimal;
            residualValue: import("@prisma/client/runtime/library").Decimal;
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
    generateCode(date: string): Promise<string>;
    findAll(page?: number, limit?: number): Promise<{
        data: {
            name: string;
            code: string;
            type: string;
            acquisitionDate: Date;
            acquisitionCost: import("@prisma/client/runtime/library").Decimal;
            residualValue: import("@prisma/client/runtime/library").Decimal;
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
    findOne(id: string): Promise<{
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
            amount: import("@prisma/client/runtime/library").Decimal;
            journalId: number | null;
        })[];
    } & {
        name: string;
        code: string;
        type: string;
        acquisitionDate: Date;
        acquisitionCost: import("@prisma/client/runtime/library").Decimal;
        residualValue: import("@prisma/client/runtime/library").Decimal;
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
    update(id: string, updateAssetDto: any): Promise<{
        name: string;
        code: string;
        type: string;
        acquisitionDate: Date;
        acquisitionCost: import("@prisma/client/runtime/library").Decimal;
        residualValue: import("@prisma/client/runtime/library").Decimal;
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
    remove(id: string): Promise<{
        name: string;
        code: string;
        type: string;
        acquisitionDate: Date;
        acquisitionCost: import("@prisma/client/runtime/library").Decimal;
        residualValue: import("@prisma/client/runtime/library").Decimal;
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
    runDepreciation(user: any, dateStr?: string): Promise<{
        journalId: number;
        processedCount: number;
        totalAmount: number;
    } | {
        message: string;
        processedCount: number;
    }>;
    calculateDepreciation(id: string, dateStr?: string): Promise<number>;
    payAssetPurchase(id: string, user: any, body: {
        paymentAccountId: string;
        amount: number;
        date?: string;
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
    disposeAsset(id: string, user: any, body: {
        saleAmount: number;
        paymentAccountId: string;
        gainLossAccountId?: string;
        date?: string;
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
}
