import { TabrelaService } from './tabrela.service';
import { CreateTabrelaDto } from './dto/create-tabrela.dto';
export declare class TabrelaController {
    private readonly tabrelaService;
    constructor(tabrelaService: TabrelaService);
    create(createDto: CreateTabrelaDto): Promise<{
        noTab: string;
        tglBuka: Date;
        saldo: import("@prisma/client/runtime/library").Decimal;
        interestRate: import("@prisma/client/runtime/library").Decimal;
        status: string;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        nasabahId: number;
    }>;
    findAll(): Promise<({
        nasabah: {
            nama: string;
            noKtp: string | null;
        };
    } & {
        noTab: string;
        tglBuka: Date;
        saldo: import("@prisma/client/runtime/library").Decimal;
        interestRate: import("@prisma/client/runtime/library").Decimal;
        status: string;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        nasabahId: number;
    })[]>;
    findOne(noTab: string): Promise<{
        nasabah: {
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            id: number;
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
        transactions: {
            noTab: string;
            createdBy: string | null;
            createdAt: Date;
            id: number;
            tipeTrans: string;
            nominal: import("@prisma/client/runtime/library").Decimal;
            saldoAkhir: import("@prisma/client/runtime/library").Decimal;
            keterangan: string | null;
        }[];
    } & {
        noTab: string;
        tglBuka: Date;
        saldo: import("@prisma/client/runtime/library").Decimal;
        interestRate: import("@prisma/client/runtime/library").Decimal;
        status: string;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        nasabahId: number;
    }>;
    setoran(noTab: string, body: any): Promise<{
        success: boolean;
    }>;
    penarikan(noTab: string, body: any): Promise<{
        success: boolean;
    }>;
}
