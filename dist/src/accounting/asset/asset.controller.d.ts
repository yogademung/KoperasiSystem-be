import { AssetService } from './asset.service';
export declare class AssetController {
    private readonly assetService;
    constructor(assetService: AssetService);
    create(createAssetDto: any): Promise<{
        asset: {
            id: number;
            updatedAt: Date | null;
            name: string;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            code: string;
            type: string;
            status: string;
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
        };
    }>;
    findAll(page?: string, limit?: string): Promise<{
        data: {
            id: number;
            updatedAt: Date | null;
            name: string;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            code: string;
            type: string;
            status: string;
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
            } | null;
        } & {
            id: number;
            createdAt: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            journalId: number | null;
            period: string;
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
        type: string;
        status: string;
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
        id: number;
        updatedAt: Date | null;
        name: string;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        code: string;
        type: string;
        status: string;
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
        id: number;
        updatedAt: Date | null;
        name: string;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        code: string;
        type: string;
        status: string;
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
