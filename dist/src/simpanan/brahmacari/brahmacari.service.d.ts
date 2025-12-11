import { PrismaService } from '../../database/prisma.service';
import { CreateBrahmacariDto } from './dto/create-brahmacari.dto';
import { BrahmacariTransactionDto } from './dto/transaction.dto';
export declare class BrahmacariService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createDto: CreateBrahmacariDto): Promise<{
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        status: string;
        nasabahId: number;
        tglBuka: Date;
        saldo: import("@prisma/client/runtime/library").Decimal;
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
        status: string;
        nasabahId: number;
        tglBuka: Date;
        saldo: import("@prisma/client/runtime/library").Decimal;
        interestRate: import("@prisma/client/runtime/library").Decimal;
        noBrahmacari: string;
    })[]>;
    findOne(noBrahmacari: string): Promise<{
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
            noBrahmacari: string;
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
        noBrahmacari: string;
    }>;
    setoran(noBrahmacari: string, dto: BrahmacariTransactionDto): Promise<{
        id: number;
        createdBy: string | null;
        createdAt: Date;
        nominal: import("@prisma/client/runtime/library").Decimal;
        noBrahmacari: string;
        keterangan: string | null;
        tipeTrans: string;
        saldoAkhir: import("@prisma/client/runtime/library").Decimal;
    }>;
    penarikan(noBrahmacari: string, dto: BrahmacariTransactionDto): Promise<{
        id: number;
        createdBy: string | null;
        createdAt: Date;
        nominal: import("@prisma/client/runtime/library").Decimal;
        noBrahmacari: string;
        keterangan: string | null;
        tipeTrans: string;
        saldoAkhir: import("@prisma/client/runtime/library").Decimal;
    }>;
    getTransactions(noBrahmacari: string, page?: number, limit?: number): Promise<{
        data: {
            id: number;
            createdBy: string | null;
            createdAt: Date;
            nominal: import("@prisma/client/runtime/library").Decimal;
            noBrahmacari: string;
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
