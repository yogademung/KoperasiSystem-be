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
            collaterals: {
                collateral: {
                    assessedValue: number;
                    id: number;
                    nasabahId: number;
                    status: string;
                    createdBy: string | null;
                    createdAt: Date;
                    updatedBy: string | null;
                    updatedAt: Date | null;
                    type: string;
                    description: string | null;
                    marketValue: import("@prisma/client/runtime/library").Decimal;
                    details: string | null;
                    photos: string | null;
                };
                creditId: number;
                collateralId: number;
            }[];
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
            tglBayar: Date | null;
            sisaBunga: import("@prisma/client/runtime/library").Decimal;
        }[];
        transaksi: {
            nominal: number;
            id: number;
            createdBy: string | null;
            createdAt: Date;
            debiturKreditId: number;
            tipeTrans: string;
            keterangan: string | null;
            bungaBayar: import("@prisma/client/runtime/library").Decimal | null;
            dendaBayar: import("@prisma/client/runtime/library").Decimal | null;
            journalId: number | null;
            pokokBayar: import("@prisma/client/runtime/library").Decimal | null;
            tglTrans: Date;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
        }[];
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
        title: string;
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
        title: string;
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
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            nama: string;
            noKtp: string | null;
            alamat: string | null;
            email: string | null;
            telepon: string | null;
            tempatLahir: string | null;
            tanggalLahir: Date | null;
            jenisKelamin: string | null;
            pekerjaan: string | null;
            fileKtp: string | null;
            fileKk: string | null;
            isActive: boolean;
        };
    }>;
    getBrahmacariClosureData(noBrahmacari: string): Promise<{
        template: string;
        title: string;
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
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            nama: string;
            noKtp: string | null;
            alamat: string | null;
            email: string | null;
            telepon: string | null;
            tempatLahir: string | null;
            tanggalLahir: Date | null;
            jenisKelamin: string | null;
            pekerjaan: string | null;
            fileKtp: string | null;
            fileKk: string | null;
            isActive: boolean;
        };
    }>;
    getBalimesariClosureData(noBalimesari: string): Promise<{
        template: string;
        title: string;
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
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            nama: string;
            noKtp: string | null;
            alamat: string | null;
            email: string | null;
            telepon: string | null;
            tempatLahir: string | null;
            tanggalLahir: Date | null;
            jenisKelamin: string | null;
            pekerjaan: string | null;
            fileKtp: string | null;
            fileKk: string | null;
            isActive: boolean;
        };
    }>;
    getWanaprastaClosureData(noWanaprasta: string): Promise<{
        template: string;
        title: string;
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
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            nama: string;
            noKtp: string | null;
            alamat: string | null;
            email: string | null;
            telepon: string | null;
            tempatLahir: string | null;
            tanggalLahir: Date | null;
            jenisKelamin: string | null;
            pekerjaan: string | null;
            fileKtp: string | null;
            fileKk: string | null;
            isActive: boolean;
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
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            nama: string;
            noKtp: string | null;
            alamat: string | null;
            email: string | null;
            telepon: string | null;
            tempatLahir: string | null;
            tanggalLahir: Date | null;
            jenisKelamin: string | null;
            pekerjaan: string | null;
            fileKtp: string | null;
            fileKk: string | null;
            isActive: boolean;
        };
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
    getAccountsList(): Promise<{
        accountCode: string;
        accountName: string;
    }[]>;
    private getGenericReceiptData;
    getAnggotaReceiptData(accountNumber: string): Promise<{
        header: {
            noRekening: string;
            nama: string;
        };
        data: {
            date: Date;
            debit: number;
            credit: number;
            balance: number;
            description: string;
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
            totalCollectors: number;
            totalMembersRegistered: any;
            totalTransactions: any;
            totalAmount: any;
        };
    }>;
    exportCoaCsv(): Promise<Buffer>;
    exportCoaPdf(): Promise<Buffer>;
}
