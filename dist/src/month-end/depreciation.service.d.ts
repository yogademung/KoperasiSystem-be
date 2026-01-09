import { PrismaService } from '../database/prisma.service';
export declare class DepreciationService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    calculateMonthlyDepreciation(period: string): Promise<{
        items: {
            asset: any;
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
