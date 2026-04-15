import { PrismaService } from '../database/prisma.service';
export declare class DepreciationService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    calculateMonthlyDepreciation(period: string): Promise<{
        items: {
            asset: {
                id: number;
                createdBy: string | null;
                createdAt: Date;
                updatedBy: string | null;
                updatedAt: Date | null;
                name: string;
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
            amount: number;
        }[];
        totalAmount: number;
    }>;
    postMonthlyDepreciation(period: string, userId: number): Promise<{
        message: string;
        success?: undefined;
        count?: undefined;
        total?: undefined;
    } | {
        success: boolean;
        count: number;
        total: number;
        message?: undefined;
    }>;
}
