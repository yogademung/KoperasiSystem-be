import { PrismaService } from '../database/prisma.service';
export declare class SimpananInterestService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    handleDailyScheduler(): Promise<void>;
    forceRunAllInterest(): Promise<void>;
    processDepositoInterest(targetNoJangka?: string): Promise<void>;
    simulateProcessing(noJangka: string): Promise<{
        noJangka: string;
        nama: string;
        nominal: import("@prisma/client/runtime/library").Decimal;
        rate: import("@prisma/client/runtime/library").Decimal;
        grossInterest: number;
        tax: number;
        netInterest: number;
        payoutMode: string;
        targetAccountId: string | null;
    }>;
    processTabrelaInterest(): Promise<void>;
    processBrahmacariInterest(): Promise<void>;
    processBalimesariInterest(): Promise<void>;
    processWanaprastaInterest(): Promise<void>;
    private createTransaction;
}
