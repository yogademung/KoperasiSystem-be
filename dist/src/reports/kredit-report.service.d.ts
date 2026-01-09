import { PrismaService } from '../database/prisma.service';
export declare class KreditReportService {
    private prisma;
    constructor(prisma: PrismaService);
    getKolektibilitas(period: string): Promise<{
        totalKredit: any;
        totalOutstanding: number;
        lancar: {
            count: number;
            outstanding: number;
        };
        kurangLancar: {
            count: number;
            outstanding: number;
        };
        diragukan: {
            count: number;
            outstanding: number;
        };
        macet: {
            count: number;
            outstanding: number;
        };
    }>;
    generateKolektibilitasPDF(period: string): Promise<Buffer>;
    getDaftarKredit(status?: string): Promise<any>;
    generateDaftarKreditExcel(status?: string): Promise<any>;
    getTunggakan(asOf: string): Promise<any>;
    generateTunggakanPDF(asOf: string): Promise<Buffer>;
}
