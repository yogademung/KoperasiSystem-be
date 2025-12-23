import { ReportsService } from './reports.service';
import { AssetService } from '../accounting/asset/asset.service';
export declare class ReportsController {
    private readonly reportsService;
    private readonly assetService;
    constructor(reportsService: ReportsService, assetService: AssetService);
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
}
