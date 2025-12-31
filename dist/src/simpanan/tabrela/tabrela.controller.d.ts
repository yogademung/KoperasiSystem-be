import { TabrelaService } from './tabrela.service';
import { CreateTabrelaDto } from './dto/create-tabrela.dto';
export declare class TabrelaController {
    private readonly tabrelaService;
    constructor(tabrelaService: TabrelaService);
    create(createDto: CreateTabrelaDto): Promise<{
        updatedAt: Date | null;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        status: string;
        noTab: string;
        nasabahId: number;
        tglBuka: Date;
        saldo: import("@prisma/client/runtime/library").Decimal;
        interestRate: import("@prisma/client/runtime/library").Decimal;
    }>;
    findAll(): Promise<({
        nasabah: {
            nama: string;
            noKtp: string | null;
        };
    } & {
        updatedAt: Date | null;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        status: string;
        noTab: string;
        nasabahId: number;
        tglBuka: Date;
        saldo: import("@prisma/client/runtime/library").Decimal;
        interestRate: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    findOne(noTab: string): Promise<{
        nasabah: {
            id: number;
            updatedAt: Date | null;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            nama: string;
            alamat: string | null;
            noKtp: string | null;
            email: string | null;
            telepon: string | null;
            tempatLahir: string | null;
            tanggalLahir: Date | null;
            jenisKelamin: string | null;
            pekerjaan: string | null;
            fileKtp: string | null;
            fileKk: string | null;
        };
        transactions: {
            id: number;
            createdBy: string | null;
            createdAt: Date;
            noTab: string;
            nominal: import("@prisma/client/runtime/library").Decimal;
            keterangan: string | null;
            tipeTrans: string;
            saldoAkhir: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        updatedAt: Date | null;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        status: string;
        noTab: string;
        nasabahId: number;
        tglBuka: Date;
        saldo: import("@prisma/client/runtime/library").Decimal;
        interestRate: import("@prisma/client/runtime/library").Decimal;
    }>;
    setoran(noTab: string, body: any): Promise<{
        success: boolean;
    }>;
    penarikan(noTab: string, body: any): Promise<{
        success: boolean;
    }>;
    close(noTab: string, body: {
        reason: string;
        penalty?: number;
        adminFee?: number;
    }): Promise<{
        success: boolean;
        refund: number;
    }>;
}
