import { PrismaService } from '../../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateWanaprastaDto } from './dto/create-wanaprasta.dto';
import { WanaprastaTransactionDto } from './dto/transaction.dto';
export declare class WanaprastaService {
    private prisma;
    private eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    create(createDto: CreateWanaprastaDto): Promise<{
        updatedAt: Date | null;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
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
        updatedAt: Date | null;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        saldo: import("@prisma/client/runtime/library").Decimal;
        status: string;
        nasabahId: number;
        tglBuka: Date;
        interestRate: import("@prisma/client/runtime/library").Decimal;
        noWanaprasta: string;
    })[]>;
    findOne(noWanaprasta: string): Promise<{
        transactions: {
            id: number;
            createdBy: string | null;
            createdAt: Date;
            nominal: import("@prisma/client/runtime/library").Decimal;
            noWanaprasta: string;
            keterangan: string | null;
            tipeTrans: string;
            saldoAkhir: import("@prisma/client/runtime/library").Decimal;
        }[];
        nasabah: {
            id: number;
            updatedAt: Date | null;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
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
        updatedAt: Date | null;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        saldo: import("@prisma/client/runtime/library").Decimal;
        status: string;
        nasabahId: number;
        tglBuka: Date;
        interestRate: import("@prisma/client/runtime/library").Decimal;
        noWanaprasta: string;
    }>;
    setoran(noWanaprasta: string, dto: WanaprastaTransactionDto): Promise<{
        id: number;
        createdBy: string | null;
        createdAt: Date;
        nominal: import("@prisma/client/runtime/library").Decimal;
        noWanaprasta: string;
        keterangan: string | null;
        tipeTrans: string;
        saldoAkhir: import("@prisma/client/runtime/library").Decimal;
    }>;
    penarikan(noWanaprasta: string, dto: WanaprastaTransactionDto): Promise<{
        id: number;
        createdBy: string | null;
        createdAt: Date;
        nominal: import("@prisma/client/runtime/library").Decimal;
        noWanaprasta: string;
        keterangan: string | null;
        tipeTrans: string;
        saldoAkhir: import("@prisma/client/runtime/library").Decimal;
    }>;
    getTransactions(noWanaprasta: string, page?: number, limit?: number): Promise<{
        data: {
            id: number;
            createdBy: string | null;
            createdAt: Date;
            nominal: import("@prisma/client/runtime/library").Decimal;
            noWanaprasta: string;
            keterangan: string | null;
            tipeTrans: string;
            saldoAkhir: import("@prisma/client/runtime/library").Decimal;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    voidTransaction(transId: number, txInput?: any): Promise<any>;
}
