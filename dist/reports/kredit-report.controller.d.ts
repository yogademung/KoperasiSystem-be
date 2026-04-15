import { KreditReportService } from './kredit-report.service';
import { Response } from 'express';
export declare class KreditReportController {
    private readonly kreditReportService;
    constructor(kreditReportService: KreditReportService);
    getKolektibilitas(period: string): Promise<{
        totalKredit: number;
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
    getDaftarKredit(status?: string): Promise<{
        nomorKredit: string | null;
        namaDebitur: string;
        jenisKredit: string;
        tglRealisasi: Date;
        nominal: number;
        sisaPokok: number;
        sisaBunga: number;
        status: string;
    }[]>;
    downloadDaftarKreditExcel(status: string, res: Response): Promise<void>;
    getTunggakan(asOf: string): Promise<{
        nomorKredit: string | null;
        namaDebitur: string;
        angsuranKe: number;
        tglJatuhTempo: Date;
        hariTerlambat: number;
        pokokTunggakan: number;
        bungaTunggakan: number;
        denda: number;
        totalTunggakan: number;
    }[]>;
    downloadTunggakanPDF(asOf: string, res: Response): Promise<void>;
}
