import { PrismaService } from '../database/prisma.service';
import { AccountingService } from '../accounting/accounting.service';
export declare class KreditService {
    private prisma;
    private accountingService;
    constructor(prisma: PrismaService, accountingService: AccountingService);
    createApplication(data: any, userId: number): Promise<any>;
    private generatePermohonanNumber;
    addCollateral(creditId: number, data: any, userId: number): Promise<any>;
    submitAnalysis(creditId: number, data: any, userId: number): Promise<any>;
    approveCredit(creditId: number, decision: any, userId: number): Promise<any>;
    activateCredit(creditId: number, data: any, userId: number): Promise<any>;
    payInstallment(creditId: number, data: any, userId: number): Promise<any>;
    private generateSpkNumber;
    private getRomanMonth;
    private generateAccountNumber;
    private calculateInstallmentSchedule;
    findAll(page?: number, limit?: number, status?: string): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: number): Promise<any>;
}
