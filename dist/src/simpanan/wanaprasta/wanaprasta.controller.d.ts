import { WanaprastaService } from './wanaprasta.service';
import { CreateWanaprastaDto } from './dto/create-wanaprasta.dto';
import { WanaprastaTransactionDto } from './dto/transaction.dto';
export declare class WanaprastaController {
    private readonly wanaprastaService;
    constructor(wanaprastaService: WanaprastaService);
    create(createDto: CreateWanaprastaDto): Promise<{
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        saldo: import("@prisma/client/runtime/library").Decimal;
        status: string;
        nasabahId: number;
        tglBuka: Date;
        interestRate: import("@prisma/client/runtime/library").Decimal;
        noWanaprasta: string;
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
        saldo: import("@prisma/client/runtime/library").Decimal;
        status: string;
        nasabahId: number;
        tglBuka: Date;
        interestRate: import("@prisma/client/runtime/library").Decimal;
        noWanaprasta: string;
    })[]>;
    findOne(noWanaprasta: string): Promise<{
        transactions: {
            createdBy: string | null;
            createdAt: Date;
            id: number;
            nominal: import("@prisma/client/runtime/library").Decimal;
            noWanaprasta: string;
            tipeTrans: string;
            saldoAkhir: import("@prisma/client/runtime/library").Decimal;
            keterangan: string | null;
        }[];
        nasabah: {
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            id: number;
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
    } & {
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        saldo: import("@prisma/client/runtime/library").Decimal;
        status: string;
        nasabahId: number;
        tglBuka: Date;
        interestRate: import("@prisma/client/runtime/library").Decimal;
        noWanaprasta: string;
    }>;
    setoran(noWanaprasta: string, dto: WanaprastaTransactionDto): Promise<{
        createdBy: string | null;
        createdAt: Date;
        id: number;
        nominal: import("@prisma/client/runtime/library").Decimal;
        noWanaprasta: string;
        tipeTrans: string;
        saldoAkhir: import("@prisma/client/runtime/library").Decimal;
        keterangan: string | null;
    }>;
    penarikan(noWanaprasta: string, dto: WanaprastaTransactionDto): Promise<{
        createdBy: string | null;
        createdAt: Date;
        id: number;
        nominal: import("@prisma/client/runtime/library").Decimal;
        noWanaprasta: string;
        tipeTrans: string;
        saldoAkhir: import("@prisma/client/runtime/library").Decimal;
        keterangan: string | null;
    }>;
    getTransactions(noWanaprasta: string, page?: string, limit?: string): Promise<{
        data: {
            createdBy: string | null;
            createdAt: Date;
            id: number;
            nominal: import("@prisma/client/runtime/library").Decimal;
            noWanaprasta: string;
            tipeTrans: string;
            saldoAkhir: import("@prisma/client/runtime/library").Decimal;
            keterangan: string | null;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
