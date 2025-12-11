import { BalimesariService } from './balimesari.service';
import { CreateBalimesariDto } from './dto/create-balimesari.dto';
import { BalimesariTransactionDto } from './dto/transaction.dto';
export declare class BalimesariController {
    private readonly balimesariService;
    constructor(balimesariService: BalimesariService);
    create(createDto: CreateBalimesariDto): Promise<{
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        status: string;
        nasabahId: number;
        tglBuka: Date;
        saldo: import("@prisma/client/runtime/library").Decimal;
        interestRate: import("@prisma/client/runtime/library").Decimal;
        noBalimesari: string;
    }>;
    findAll(): Promise<({
        nasabah: {
            nama: string;
            noKtp: string | null;
        };
    } & {
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        status: string;
        nasabahId: number;
        tglBuka: Date;
        saldo: import("@prisma/client/runtime/library").Decimal;
        interestRate: import("@prisma/client/runtime/library").Decimal;
        noBalimesari: string;
    })[]>;
    findOne(noBalimesari: string): Promise<{
        nasabah: {
            id: number;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
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
            nominal: import("@prisma/client/runtime/library").Decimal;
            noBalimesari: string;
            keterangan: string | null;
            tipeTrans: string;
            saldoAkhir: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        status: string;
        nasabahId: number;
        tglBuka: Date;
        saldo: import("@prisma/client/runtime/library").Decimal;
        interestRate: import("@prisma/client/runtime/library").Decimal;
        noBalimesari: string;
    }>;
    setoran(noBalimesari: string, dto: BalimesariTransactionDto): Promise<{
        id: number;
        createdBy: string | null;
        createdAt: Date;
        nominal: import("@prisma/client/runtime/library").Decimal;
        noBalimesari: string;
        keterangan: string | null;
        tipeTrans: string;
        saldoAkhir: import("@prisma/client/runtime/library").Decimal;
    }>;
    penarikan(noBalimesari: string, dto: BalimesariTransactionDto): Promise<{
        id: number;
        createdBy: string | null;
        createdAt: Date;
        nominal: import("@prisma/client/runtime/library").Decimal;
        noBalimesari: string;
        keterangan: string | null;
        tipeTrans: string;
        saldoAkhir: import("@prisma/client/runtime/library").Decimal;
    }>;
    getTransactions(noBalimesari: string, page?: string, limit?: string): Promise<{
        data: {
            id: number;
            createdBy: string | null;
            createdAt: Date;
            nominal: import("@prisma/client/runtime/library").Decimal;
            noBalimesari: string;
            keterangan: string | null;
            tipeTrans: string;
            saldoAkhir: import("@prisma/client/runtime/library").Decimal;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
