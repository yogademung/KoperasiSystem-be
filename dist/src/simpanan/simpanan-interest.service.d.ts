import { PrismaService } from '../database/prisma.service';
export declare class SimpananInterestService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    handleMonthlyInterest(): Promise<void>;
    processTabrelaInterest(): Promise<void>;
    processBrahmacariInterest(): Promise<void>;
    processBalimesariInterest(): Promise<void>;
    processWanaprastaInterest(): Promise<void>;
    private createTransaction;
}
