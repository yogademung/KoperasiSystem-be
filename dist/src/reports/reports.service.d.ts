import { PrismaService } from '../database/prisma.service';
import { SettingsService } from '../settings/settings.service';
export declare class ReportsService {
    private prisma;
    private settingsService;
    constructor(prisma: PrismaService, settingsService: SettingsService);
    getCreditApplicationData(id: number): Promise<{
        template: string;
        companyProfile: Record<string, string>;
        noPermohonan: string | null;
        tanggal: Date;
        nasabah: {
            nama: string;
            alamat: string | null;
            pekerjaan: string | null;
            ktp: string | null;
        };
        pengajuan: {
            nominal: number;
            terbilang: string;
            jangkaWaktu: number | null;
            tujuan: string | null;
            jenis: string;
        };
    }>;
    getCreditAgreementData(id: number): Promise<{
        template: string;
        companyProfile: Record<string, string>;
        nomorSpk: string;
        tanggalAkad: Date;
        pihakPertama: {
            nama: string;
            jabatan: string;
        };
        pihakKedua: {
            nama: string;
            alamat: string | null;
            ktp: string | null;
        };
        pinjaman: {
            nominal: number;
            terbilang: string;
            bungaPct: import("@prisma/client/runtime/library").Decimal | null;
            jangkaWaktu: number | null;
            angsuranPokok: number;
        };
        jaminan: {
            jenis: string;
            keterangan: string | null;
            nilai: number;
        }[];
    }>;
    getCreditStatementData(id: number): Promise<{
        template: string;
        companyProfile: Record<string, string>;
        header: {
            noRekening: string | null;
            nama: string;
            alamat: string | null;
            plafon: number;
            jangkaWaktu: number | null;
            bungaPct: import("@prisma/client/runtime/library").Decimal | null;
        };
        jadwal: {
            angsuranPokok: number;
            angsuranBunga: number;
            totalAngsuran: number;
            sisaPinjaman: number;
            id: number;
            status: string;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            debiturKreditId: number;
            angsuranKe: number;
            tglJatuhTempo: Date;
            pokok: import("@prisma/client/runtime/library").Decimal;
            bunga: import("@prisma/client/runtime/library").Decimal;
            total: import("@prisma/client/runtime/library").Decimal;
            sisaPokok: import("@prisma/client/runtime/library").Decimal;
            sisaBunga: import("@prisma/client/runtime/library").Decimal;
            tglBayar: Date | null;
        }[];
        transaksi: {
            nominal: number;
            id: number;
            createdBy: string | null;
            createdAt: Date;
            debiturKreditId: number;
            tipeTrans: string;
            tglTrans: Date;
            pokokBayar: import("@prisma/client/runtime/library").Decimal | null;
            bungaBayar: import("@prisma/client/runtime/library").Decimal | null;
            dendaBayar: import("@prisma/client/runtime/library").Decimal | null;
            journalId: number | null;
            keterangan: string | null;
        }[];
    }>;
    getSavingsPassbookData(type: 'TABUNGAN' | 'BRAHMACARI' | 'BALIMESARI' | 'WANAPRASTA' | 'ANGGOTA', accountNumber: string): Promise<{
        template: string;
        title: string;
        companyProfile: Record<string, string>;
        header: {
            noRekening: string;
            nama: any;
            alamat: any;
            id: any;
            tglBuka: any;
        };
        data: {
            date: any;
            code: any;
            debit: number;
            credit: number;
            balance: number;
            description: any;
        }[];
    }>;
    getDepositoCertificateData(noJangka: string): Promise<{
        template: string;
        companyProfile: Record<string, string>;
        nomorBilyet: string;
        nasabah: {
            nama: string;
            alamat: string | null;
            id: number;
        };
        detail: {
            nominal: number;
            terbilang: string;
            jangkaWaktu: string;
            bungaPct: import("@prisma/client/runtime/library").Decimal;
            tglMulai: Date;
            tglJatuhTempo: Date;
            perpanjanganOtomatis: string;
        };
    }>;
    private normalizeCurrency;
    private getTerbilangWords;
    private terbilang;
}
