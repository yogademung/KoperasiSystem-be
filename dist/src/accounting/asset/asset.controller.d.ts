import { AssetService } from './asset.service';
export declare class AssetController {
    private readonly assetService;
    constructor(assetService: AssetService);
    create(user: any, createAssetDto: any): Promise<{
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
            acquisitionCost: import("@prisma/client/runtime/library").Decimal;
            residualValue: import("@prisma/client/runtime/library").Decimal;
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
    findAll(page?: string, limit?: string): Promise<{
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
            acquisitionCost: import("@prisma/client/runtime/library").Decimal;
            residualValue: import("@prisma/client/runtime/library").Decimal;
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
    findOne(id: string): Promise<{
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
            amount: import("@prisma/client/runtime/library").Decimal;
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
        acquisitionCost: import("@prisma/client/runtime/library").Decimal;
        residualValue: import("@prisma/client/runtime/library").Decimal;
        usefulLifeYears: number;
        depreciationRate: number;
        depreciationMethod: string;
        assetAccountId: string;
        accumDepreciationAccountId: string;
        expenseAccountId: string;
    }>;
    update(id: string, updateAssetDto: any): Promise<{
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
        acquisitionCost: import("@prisma/client/runtime/library").Decimal;
        residualValue: import("@prisma/client/runtime/library").Decimal;
        usefulLifeYears: number;
        depreciationRate: number;
        depreciationMethod: string;
        assetAccountId: string;
        accumDepreciationAccountId: string;
        expenseAccountId: string;
    }>;
    remove(id: string): Promise<{
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
        acquisitionCost: import("@prisma/client/runtime/library").Decimal;
        residualValue: import("@prisma/client/runtime/library").Decimal;
        usefulLifeYears: number;
        depreciationRate: number;
        depreciationMethod: string;
        assetAccountId: string;
        accumDepreciationAccountId: string;
        expenseAccountId: string;
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
}
