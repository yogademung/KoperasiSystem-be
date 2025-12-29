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
            updatedAt: Date | null;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            status: string;
            pokok: import("@prisma/client/runtime/library").Decimal;
            tglJatuhTempo: Date;
            bunga: import("@prisma/client/runtime/library").Decimal;
            total: import("@prisma/client/runtime/library").Decimal;
            debiturKreditId: number;
            angsuranKe: number;
            sisaPokok: import("@prisma/client/runtime/library").Decimal;
            sisaBunga: import("@prisma/client/runtime/library").Decimal;
            tglBayar: Date | null;
        }[];
        transaksi: {
            nominal: number;
            id: number;
            createdBy: string | null;
            createdAt: Date;
            keterangan: string | null;
            tipeTrans: string;
            journalId: number | null;
            debiturKreditId: number;
            tglTrans: Date;
            pokokBayar: import("@prisma/client/runtime/library").Decimal | null;
            bungaBayar: import("@prisma/client/runtime/library").Decimal | null;
            dendaBayar: import("@prisma/client/runtime/library").Decimal | null;
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
        account: {
            noRekening: string;
            nominal: number;
            terbilang: string;
            jangkaWaktu: string;
            jatuhTempo: Date;
            bunga: import("@prisma/client/runtime/library").Decimal;
            tglBuka: Date;
            perpanjanganOtomatis: string;
        };
    }>;
    getAnggotaRegistrationData(accountNumber: string): Promise<{
        template: string;
        companyProfile: Record<string, string>;
        account: {
            noRekening: string;
            tglBuka: Date;
            principal: number;
            mandatory: number;
            terbilangPokok: string;
            terbilangWajib: string;
        };
        nasabah: {
            nama: string;
            id: number;
            ktp: string | null;
            alamat: string | null;
            pekerjaan: string | null;
            phone: string | null;
        };
    }>;
    getAnggotaClosureData(accountNumber: string): Promise<{
        template: string;
        companyProfile: Record<string, string>;
        account: {
            noRekening: string;
            tglBuka: Date;
            tglTutup: Date;
            closeBalance: number;
            penalty: number;
            adminFee: number;
            refund: number;
            terbilangRefund: string;
        };
        nasabah: {
            nama: string;
            id: number;
            ktp: string | null;
            alamat: string | null;
            phone: string | null;
        };
    }>;
    getTabrelaClosureData(noTab: string): Promise<{
        template: string;
        companyProfile: Record<string, string>;
        account: {
            noRekening: string;
            tglBuka: Date;
            tglTutup: Date;
            closeBalance: number;
            penalty: number;
            adminFee: number;
            refund: number;
            terbilangRefund: string;
        };
        nasabah: {
            id: number;
            updatedAt: Date | null;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            nama: string;
            alamat: string | null;
            pekerjaan: string | null;
            noKtp: string | null;
            email: string | null;
            telepon: string | null;
            tempatLahir: string | null;
            tanggalLahir: Date | null;
            jenisKelamin: string | null;
            fileKtp: string | null;
            fileKk: string | null;
        };
    }>;
    getBrahmacariClosureData(noBrahmacari: string): Promise<{
        template: string;
        companyProfile: Record<string, string>;
        account: {
            noRekening: string;
            tglBuka: Date;
            tglTutup: Date;
            closeBalance: number;
            penalty: number;
            adminFee: number;
            refund: number;
            terbilangRefund: string;
        };
        nasabah: {
            id: number;
            updatedAt: Date | null;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            nama: string;
            alamat: string | null;
            pekerjaan: string | null;
            noKtp: string | null;
            email: string | null;
            telepon: string | null;
            tempatLahir: string | null;
            tanggalLahir: Date | null;
            jenisKelamin: string | null;
            fileKtp: string | null;
            fileKk: string | null;
        };
    }>;
    getBalimesariClosureData(noBalimesari: string): Promise<{
        template: string;
        companyProfile: Record<string, string>;
        account: {
            noRekening: string;
            tglBuka: Date;
            tglTutup: Date;
            closeBalance: number;
            penalty: number;
            adminFee: number;
            refund: number;
            terbilangRefund: string;
        };
        nasabah: {
            id: number;
            updatedAt: Date | null;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            nama: string;
            alamat: string | null;
            pekerjaan: string | null;
            noKtp: string | null;
            email: string | null;
            telepon: string | null;
            tempatLahir: string | null;
            tanggalLahir: Date | null;
            jenisKelamin: string | null;
            fileKtp: string | null;
            fileKk: string | null;
        };
    }>;
    getWanaprastaClosureData(noWanaprasta: string): Promise<{
        template: string;
        companyProfile: Record<string, string>;
        account: {
            noRekening: string;
            tglBuka: Date;
            tglTutup: Date;
            closeBalance: number;
            penalty: number;
            adminFee: number;
            refund: number;
            terbilangRefund: string;
        };
        nasabah: {
            id: number;
            updatedAt: Date | null;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            nama: string;
            alamat: string | null;
            pekerjaan: string | null;
            noKtp: string | null;
            email: string | null;
            telepon: string | null;
            tempatLahir: string | null;
            tanggalLahir: Date | null;
            jenisKelamin: string | null;
            fileKtp: string | null;
            fileKk: string | null;
        };
    }>;
    getDepositoClosureData(noJangka: string): Promise<{
        template: string;
        companyProfile: Record<string, string>;
        account: {
            noRekening: string;
            tglBuka: Date;
            tglTutup: Date;
            tglJatuhTempo: Date;
            closeBalance: number;
            penalty: number;
            adminFee: number;
            refund: number;
            terbilangRefund: string;
        };
        nasabah: {
            id: number;
            updatedAt: Date | null;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            nama: string;
            alamat: string | null;
            pekerjaan: string | null;
            noKtp: string | null;
            email: string | null;
            telepon: string | null;
            tempatLahir: string | null;
            tanggalLahir: Date | null;
            jenisKelamin: string | null;
            fileKtp: string | null;
            fileKk: string | null;
        };
    }>;
    private normalizeCurrency;
    private getTerbilangWords;
    private terbilang;
}
