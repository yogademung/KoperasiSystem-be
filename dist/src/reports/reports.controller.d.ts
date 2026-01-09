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
            totalCollectors: any;
            totalMembersRegistered: any;
            totalTransactions: any;
            totalAmount: any;
        };
    }>;
    getBalanceSheet(date: string): Promise<{
        date: Date;
        totalAcquisition: any;
        totalBookValue: any;
        details: any[];
    }>;
    getAssetMutations(startDate: string, endDate: string): Promise<{
        startDate: Date;
        endDate: Date;
        acquisitions: any;
        depreciations: any;
    }>;
    getCreditApplication(id: string): Promise<{
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
    getDepositoCertificate(id: string): Promise<{
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
    getDepositoClosure(id: string): Promise<{
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
    getAnggotaClosure(id: string): Promise<{
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
    getAnggotaReceipt(id: string): Promise<{
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
    getBrahmacariClosure(id: string): Promise<{
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
    getBalimesariClosure(id: string): Promise<{
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
    getWanaprastaClosure(id: string): Promise<{
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
    getBukuBesar(accountCode: string, toAccount: string, startDate: string, endDate: string): Promise<{
        data: any[];
    }>;
    getBukuBesarPDF(accountCode: string, toAccount: string, startDate: string, endDate: string): Promise<{
        data: any[];
    }>;
    getAccountsList(): Promise<any>;
}
