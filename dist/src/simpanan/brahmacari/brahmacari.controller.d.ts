import { BrahmacariService } from './brahmacari.service';
import { CreateBrahmacariDto } from './dto/create-brahmacari.dto';
import { BrahmacariTransactionDto } from './dto/transaction.dto';
export declare class BrahmacariController {
    private readonly brahmacariService;
    constructor(brahmacariService: BrahmacariService);
    create(createDto: CreateBrahmacariDto): Promise<{
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        saldo: import("@prisma/client/runtime/library").Decimal;
        status: string;
        nasabahId: number;
        tglBuka: Date;
        interestRate: import("@prisma/client/runtime/library").Decimal;
        noBrahmacari: string;
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
        noBrahmacari: string;
    })[]>;
    findOne(noBrahmacari: string): Promise<{
        transactions: {
            createdBy: string | null;
            createdAt: Date;
            id: number;
            nominal: import("@prisma/client/runtime/library").Decimal;
            noBrahmacari: string;
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
        noBrahmacari: string;
    }>;
    setoran(noBrahmacari: string, dto: BrahmacariTransactionDto): Promise<{
        createdBy: string | null;
        createdAt: Date;
        id: number;
        nominal: import("@prisma/client/runtime/library").Decimal;
        noBrahmacari: string;
        tipeTrans: string;
        saldoAkhir: import("@prisma/client/runtime/library").Decimal;
        keterangan: string | null;
    }>;
    penarikan(noBrahmacari: string, dto: BrahmacariTransactionDto): Promise<{
        createdBy: string | null;
        createdAt: Date;
        id: number;
        nominal: import("@prisma/client/runtime/library").Decimal;
        noBrahmacari: string;
        tipeTrans: string;
        saldoAkhir: import("@prisma/client/runtime/library").Decimal;
        keterangan: string | null;
    }>;
    getTransactions(noBrahmacari: string, page?: string, limit?: string): Promise<{
        data: {
            createdBy: string | null;
            createdAt: Date;
            id: number;
            nominal: import("@prisma/client/runtime/library").Decimal;
            noBrahmacari: string;
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
