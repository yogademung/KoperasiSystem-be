import { KreditReportService } from './kredit-report.service';
import { Response } from 'express';
export declare class KreditReportController {
    private readonly kreditReportService;
    constructor(kreditReportService: KreditReportService);
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
    downloadKolektibilitasPDF(period: string, res: Response): Promise<void>;
    getDaftarKredit(status?: string): Promise<any>;
    downloadDaftarKreditExcel(status: string, res: Response): Promise<void>;
    getTunggakan(asOf: string): Promise<any>;
    downloadTunggakanPDF(asOf: string, res: Response): Promise<void>;
}
