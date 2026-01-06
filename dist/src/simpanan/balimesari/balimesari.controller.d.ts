import { BalimesariService } from './balimesari.service';
import { CreateBalimesariDto } from './dto/create-balimesari.dto';
import { BalimesariTransactionDto } from './dto/transaction.dto';
export declare class BalimesariController {
    private readonly balimesariService;
    constructor(balimesariService: BalimesariService);
    create(createDto: CreateBalimesariDto): Promise<{
        updatedAt: Date | null;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
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
        updatedAt: Date | null;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
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
            noBalimesari: string;
            nominal: import("@prisma/client/runtime/library").Decimal;
            keterangan: string | null;
            tipeTrans: string;
            saldoAkhir: import("@prisma/client/runtime/library").Decimal;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
        }[];
    } & {
        updatedAt: Date | null;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
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
        noBalimesari: string;
        nominal: import("@prisma/client/runtime/library").Decimal;
        keterangan: string | null;
        tipeTrans: string;
        saldoAkhir: import("@prisma/client/runtime/library").Decimal;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    penarikan(noBalimesari: string, dto: BalimesariTransactionDto): Promise<{
        id: number;
        createdBy: string | null;
        createdAt: Date;
        noBalimesari: string;
        nominal: import("@prisma/client/runtime/library").Decimal;
        keterangan: string | null;
        tipeTrans: string;
        saldoAkhir: import("@prisma/client/runtime/library").Decimal;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    getTransactions(noBalimesari: string, page?: string, limit?: string): Promise<{
        data: {
            id: number;
            createdBy: string | null;
            createdAt: Date;
            noBalimesari: string;
            nominal: import("@prisma/client/runtime/library").Decimal;
            keterangan: string | null;
            tipeTrans: string;
            saldoAkhir: import("@prisma/client/runtime/library").Decimal;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    close(noBalimesari: string, body: {
        reason: string;
        penalty?: number;
        adminFee?: number;
    }): Promise<{
        success: boolean;
        refund: number;
    }>;
}
