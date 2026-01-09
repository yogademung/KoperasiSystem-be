import { PrismaService } from '../database/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { ProductConfigService } from '../product-config/product-config.service';
export declare class ReportsService {
    private prisma;
    private settingsService;
    private productConfigService;
    constructor(prisma: PrismaService, settingsService: SettingsService, productConfigService: ProductConfigService);
    getCreditApplicationData(id: number): Promise<{
        template: string;
        companyProfile: Record<string, string>;
        noPermohonan: any;
        tanggal: any;
        nasabah: {
            nama: any;
            alamat: any;
            pekerjaan: any;
            ktp: any;
        };
        pengajuan: {
            nominal: number;
            terbilang: string;
            jangkaWaktu: any;
            tujuan: any;
            jenis: any;
            collaterals: any;
        };
    }>;
    getCreditAgreementData(id: number): Promise<{
        template: string;
        companyProfile: Record<string, string>;
        nomorSpk: any;
        tanggalAkad: any;
        pihakPertama: {
            nama: any;
            jabatan: string;
        };
        pihakKedua: {
            nama: any;
            alamat: any;
            ktp: any;
        };
        pinjaman: {
            nominal: number;
            terbilang: string;
            bungaPct: any;
            jangkaWaktu: any;
            angsuranPokok: number;
        };
        jaminan: any;
    }>;
    getCreditStatementData(id: number): Promise<{
        template: string;
        companyProfile: Record<string, string>;
        header: {
            noRekening: any;
            nama: any;
            alamat: any;
            plafon: number;
            jangkaWaktu: any;
            bungaPct: any;
        };
        jadwal: any;
        transaksi: any;
    }>;
    getSavingsPassbookData(type: 'TABUNGAN' | 'BRAHMACARI' | 'BALIMESARI' | 'WANAPRASTA' | 'ANGGOTA' | 'KREDIT', accountNumber: string): Promise<{
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
        nomorBilyet: any;
        nasabah: {
            nama: any;
            alamat: any;
            id: any;
        };
        detail: {
            nominal: number;
            terbilang: string;
            jangkaWaktu: string;
            bungaPct: any;
            tglMulai: any;
            tglJatuhTempo: any;
            perpanjanganOtomatis: string;
        };
        account: {
            noRekening: any;
            nominal: number;
            terbilang: string;
            jangkaWaktu: string;
            jatuhTempo: any;
            bunga: any;
            tglBuka: any;
            perpanjanganOtomatis: string;
        };
    }>;
    getAnggotaRegistrationData(accountNumber: string): Promise<{
        template: string;
        companyProfile: Record<string, string>;
        account: {
            noRekening: any;
            tglBuka: any;
            principal: number;
            mandatory: number;
            terbilangPokok: string;
            terbilangWajib: string;
        };
        nasabah: {
            nama: any;
            id: any;
            ktp: any;
            alamat: any;
            pekerjaan: any;
            phone: any;
        };
    }>;
    getAnggotaClosureData(accountNumber: string): Promise<{
        template: string;
        title: string;
        companyProfile: Record<string, string>;
        account: {
            noRekening: any;
            tglBuka: any;
            tglTutup: any;
            closeBalance: number;
            penalty: number;
            adminFee: number;
            refund: number;
            terbilangRefund: string;
        };
        nasabah: {
            nama: any;
            id: any;
            ktp: any;
            alamat: any;
            phone: any;
        };
    }>;
    getTabrelaClosureData(noTab: string): Promise<{
        template: string;
        title: string;
        companyProfile: Record<string, string>;
        account: {
            noRekening: any;
            tglBuka: any;
            tglTutup: Date;
            closeBalance: number;
            penalty: number;
            adminFee: number;
            refund: number;
            terbilangRefund: string;
        };
        nasabah: any;
    }>;
    getBrahmacariClosureData(noBrahmacari: string): Promise<{
        template: string;
        title: string;
        companyProfile: Record<string, string>;
        account: {
            noRekening: any;
            tglBuka: any;
            tglTutup: Date;
            closeBalance: number;
            penalty: number;
            adminFee: number;
            refund: number;
            terbilangRefund: string;
        };
        nasabah: any;
    }>;
    getBalimesariClosureData(noBalimesari: string): Promise<{
        template: string;
        title: string;
        companyProfile: Record<string, string>;
        account: {
            noRekening: any;
            tglBuka: any;
            tglTutup: Date;
            closeBalance: number;
            penalty: number;
            adminFee: number;
            refund: number;
            terbilangRefund: string;
        };
        nasabah: any;
    }>;
    getWanaprastaClosureData(noWanaprasta: string): Promise<{
        template: string;
        title: string;
        companyProfile: Record<string, string>;
        account: {
            noRekening: any;
            tglBuka: any;
            tglTutup: Date;
            closeBalance: number;
            penalty: number;
            adminFee: number;
            refund: number;
            terbilangRefund: string;
        };
        nasabah: any;
    }>;
    getDepositoClosureData(noJangka: string): Promise<{
        template: string;
        companyProfile: Record<string, string>;
        account: {
            noRekening: any;
            tglBuka: any;
            tglTutup: Date;
            tglJatuhTempo: any;
            closeBalance: number;
            penalty: number;
            adminFee: number;
            refund: number;
            terbilangRefund: string;
        };
        nasabah: any;
    }>;
    private normalizeCurrency;
    private getTerbilangWords;
    private terbilang;
    getBukuBesar(fromAccount: string, toAccount: string, startDate: string, endDate: string): Promise<{
        data: any[];
    }>;
    generateBukuBesarPDF(fromAccount: string, toAccount: string, startDate: string, endDate: string): Promise<{
        data: any[];
    }>;
    getAccountsList(): Promise<any>;
    private getGenericReceiptData;
    getAnggotaReceiptData(accountNumber: string): Promise<{
        header: {
            noRekening: any;
            nama: any;
        };
        data: {
            date: any;
            debit: number;
            credit: number;
            balance: number;
            description: any;
        }[];
        companyProfile: {
            name: string;
            address: string;
            phone: string;
        };
        currentUser: string;
    }>;
    getTabrelaReceiptData(accountNumber: string): Promise<{
        header: {
            noRekening: string;
            nama: any;
        };
        data: {
            date: any;
            debit: number;
            credit: number;
            balance: number;
            description: any;
        }[];
        companyProfile: {
            name: string;
            address: string;
            phone: string;
        };
        currentUser: string;
    }>;
    getBrahmacariReceiptData(accountNumber: string): Promise<{
        header: {
            noRekening: string;
            nama: any;
        };
        data: {
            date: any;
            debit: number;
            credit: number;
            balance: number;
            description: any;
        }[];
        companyProfile: {
            name: string;
            address: string;
            phone: string;
        };
        currentUser: string;
    }>;
    getBalimesariReceiptData(accountNumber: string): Promise<{
        header: {
            noRekening: string;
            nama: any;
        };
        data: {
            date: any;
            debit: number;
            credit: number;
            balance: number;
            description: any;
        }[];
        companyProfile: {
            name: string;
            address: string;
            phone: string;
        };
        currentUser: string;
    }>;
    getWanasprastaReceiptData(accountNumber: string): Promise<{
        header: {
            noRekening: string;
            nama: any;
        };
        data: {
            date: any;
            debit: number;
            credit: number;
            balance: number;
            description: any;
        }[];
        companyProfile: {
            name: string;
            address: string;
            phone: string;
        };
        currentUser: string;
    }>;
    getCollectorKPI(startDate: Date, endDate: Date): Promise<{
        period: {
            startDate: Date;
            endDate: Date;
        };
        collectors: any[];
        summary: {
            totalCollectors: any;
            totalMembersRegistered: any;
            totalTransactions: any;
            totalAmount: any;
        };
    }>;
}
