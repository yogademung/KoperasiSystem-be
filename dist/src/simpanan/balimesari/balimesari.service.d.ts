import { PrismaService } from '../../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateBalimesariDto } from './dto/create-balimesari.dto';
import { BalimesariTransactionDto } from './dto/transaction.dto';
export declare class BalimesariService {
    private prisma;
    private eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    create(createDto: CreateBalimesariDto): Promise<{
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        saldo: import("@prisma/client/runtime/library").Decimal;
        status: string;
        nasabahId: number;
        tglBuka: Date;
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
        saldo: import("@prisma/client/runtime/library").Decimal;
        status: string;
        nasabahId: number;
        tglBuka: Date;
        interestRate: import("@prisma/client/runtime/library").Decimal;
        noBalimesari: string;
    })[]>;
    findOne(noBalimesari: string): Promise<{
        transactions: {
            createdBy: string | null;
            createdAt: Date;
            id: number;
            nominal: import("@prisma/client/runtime/library").Decimal;
            noBalimesari: string;
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
        noBalimesari: string;
    }>;
    setoran(noBalimesari: string, dto: BalimesariTransactionDto): Promise<{
        createdBy: string | null;
        createdAt: Date;
        id: number;
        nominal: import("@prisma/client/runtime/library").Decimal;
        noBalimesari: string;
        tipeTrans: string;
        saldoAkhir: import("@prisma/client/runtime/library").Decimal;
        keterangan: string | null;
    }>;
    penarikan(noBalimesari: string, dto: BalimesariTransactionDto): Promise<{
        createdBy: string | null;
        createdAt: Date;
        id: number;
        nominal: import("@prisma/client/runtime/library").Decimal;
        noBalimesari: string;
        tipeTrans: string;
        saldoAkhir: import("@prisma/client/runtime/library").Decimal;
        keterangan: string | null;
    }>;
    getTransactions(noBalimesari: string, page?: number, limit?: number): Promise<{
        data: {
            createdBy: string | null;
            createdAt: Date;
            id: number;
            nominal: import("@prisma/client/runtime/library").Decimal;
            noBalimesari: string;
            tipeTrans: string;
            saldoAkhir: import("@prisma/client/runtime/library").Decimal;
            keterangan: string | null;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    voidTransaction(transId: number, txInput?: any): Promise<any>;
}
