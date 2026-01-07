import { PrismaService } from '../database/prisma.service';
export declare class DepreciationService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    calculateMonthlyDepreciation(period: string): Promise<{
        items: {
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
