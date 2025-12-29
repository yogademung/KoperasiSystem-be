import { PrismaService } from '../database/prisma.service';
export declare class BalanceSheetService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    validateBalance(period: string): Promise<{
        valid: boolean;
        shu: number;
        assets: number;
    }>;
    processRetainedEarnings(period: string, user_id: number): Promise<void>;
}
