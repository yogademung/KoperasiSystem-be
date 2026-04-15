import { PrismaService } from '../database/prisma.service';
export declare class KreditReportService {
    private prisma;
    constructor(prisma: PrismaService);
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
    generateKolektibilitasPDF(period: string): Promise<Buffer>;
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
    generateDaftarKreditExcel(status?: string): Promise<any>;
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
    generateTunggakanPDF(asOf: string): Promise<Buffer>;
}
