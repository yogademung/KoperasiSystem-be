import { PrismaService } from '../database/prisma.service';
export declare class DataProviderService {
    private prisma;
    constructor(prisma: PrismaService);
    getReportData(productModule: string, recordId?: string, parameters?: Record<string, any>): Promise<Record<string, any>>;
    private getSimpananData;
    private getKreditData;
    private getAnggotaData;
    private getAccountingData;
    private getDepositoData;
    private getGenericData;
    private formatDate;
    private formatCurrency;
    private numberToWords;
}
