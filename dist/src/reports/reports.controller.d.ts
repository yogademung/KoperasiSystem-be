import { Response } from 'express';
import { ReportsService } from './reports.service';
import { AssetService } from '../accounting/asset/asset.service';
export declare class ReportsController {
    private readonly reportsService;
    private readonly assetService;
    constructor(reportsService: ReportsService, assetService: AssetService);
    getCollectorKPI(startDate: string, endDate: string): Promise<{
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
    getBalanceSheet(date: string): Promise<{
        date: Date;
        totalAcquisition: import("@prisma/client/runtime/library").Decimal;
        totalBookValue: import("@prisma/client/runtime/library").Decimal;
        details: {
            id: number;
            code: string;
            name: string;
            type: string;
            acquisitionCost: import("@prisma/client/runtime/library").Decimal;
            accumulatedDepreciation: import("@prisma/client/runtime/library").Decimal;
            bookValue: import("@prisma/client/runtime/library").Decimal;
        }[];
    }>;
    getAssetMutations(startDate: string, endDate: string): Promise<{
        startDate: Date;
        endDate: Date;
        acquisitions: {
            type: string;
            date: Date;
            asset: string;
            amount: import("@prisma/client/runtime/library").Decimal;
        }[];
        depreciations: {
            type: string;
            period: string;
            asset: string;
            amount: import("@prisma/client/runtime/library").Decimal;
        }[];
    }>;
    getCreditApplication(id: string): Promise<{
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
                    type: string;
                    status: string;
                    createdBy: string | null;
                    createdAt: Date;
                    updatedBy: string | null;
                    updatedAt: Date | null;
                    id: number;
                    description: string | null;
                    details: string | null;
                    nasabahId: number;
                    marketValue: import("@prisma/client/runtime/library").Decimal;
                    photos: string | null;
                };
                creditId: number;
                collateralId: number;
            }[];
        };
    }>;
    getCreditAgreement(id: string): Promise<{
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
    getCreditStatement(id: string): Promise<{
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
            status: string;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            id: number;
            total: import("@prisma/client/runtime/library").Decimal;
            bunga: import("@prisma/client/runtime/library").Decimal;
            debiturKreditId: number;
            angsuranKe: number;
            tglJatuhTempo: Date;
            pokok: import("@prisma/client/runtime/library").Decimal;
            sisaPokok: import("@prisma/client/runtime/library").Decimal;
            tglBayar: Date | null;
            sisaBunga: import("@prisma/client/runtime/library").Decimal;
        }[];
        transaksi: {
            nominal: number;
            createdBy: string | null;
            createdAt: Date;
            id: number;
            journalId: number | null;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
            tipeTrans: string;
            keterangan: string | null;
            debiturKreditId: number;
            bungaBayar: import("@prisma/client/runtime/library").Decimal | null;
            dendaBayar: import("@prisma/client/runtime/library").Decimal | null;
            pokokBayar: import("@prisma/client/runtime/library").Decimal | null;
            tglTrans: Date;
        }[];
    }>;
    getDepositoCertificate(id: string): Promise<{
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
    getDepositoClosure(id: string): Promise<{
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
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            id: number;
            isActive: boolean;
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
        };
    }>;
    getSavingsPassbook(type: string, id: string): Promise<{
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
    getAnggotaRegistration(id: string): Promise<{
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
    getAnggotaClosure(id: string): Promise<{
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
    getAnggotaReceipt(id: string): Promise<{
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
    getTabrelaReceipt(id: string): Promise<{
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
    getBrahmacariReceipt(id: string): Promise<{
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
    getBalimesariReceipt(id: string): Promise<{
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
    getWanasprastaReceipt(id: string): Promise<{
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
    getTabrelaClosure(id: string): Promise<{
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
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            id: number;
            isActive: boolean;
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
        };
    }>;
    getBrahmacariClosure(id: string): Promise<{
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
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            id: number;
            isActive: boolean;
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
        };
    }>;
    getBalimesariClosure(id: string): Promise<{
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
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            id: number;
            isActive: boolean;
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
        };
    }>;
    getWanaprastaClosure(id: string): Promise<{
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
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            id: number;
            isActive: boolean;
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
        };
    }>;
    getBukuBesar(accountCode: string, toAccount: string, startDate: string, endDate: string): Promise<{
        data: any[];
    }>;
    getBukuBesarPDF(accountCode: string, toAccount: string, startDate: string, endDate: string): Promise<{
        data: any[];
    }>;
    getAccountsList(): Promise<{
        accountCode: string;
        accountName: string;
    }[]>;
    exportCoaPdf(res: Response): Promise<void>;
    exportCoaCsv(res: Response): Promise<void>;
}
