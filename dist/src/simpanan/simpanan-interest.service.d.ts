import { PrismaService } from '../database/prisma.service';
export declare class SimpananInterestService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    handleDailyScheduler(): Promise<void>;
    forceRunAllInterest(): Promise<void>;
    processDepositoInterest(targetNoJangka?: string): Promise<void>;
    simulateProcessing(noJangka: string): Promise<{
        noJangka: any;
        nama: any;
        nominal: any;
        rate: any;
        grossInterest: number;
        tax: number;
        netInterest: number;
        payoutMode: any;
        targetAccountId: any;
    }>;
    processTabrelaInterest(): Promise<void>;
    processBrahmacariInterest(): Promise<void>;
    processBalimesariInterest(): Promise<void>;
    processWanaprastaInterest(): Promise<void>;
    private createTransaction;
}
