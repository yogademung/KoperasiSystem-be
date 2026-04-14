import { PrismaService } from '../../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateBalimesariDto } from './dto/create-balimesari.dto';
import { BalimesariTransactionDto } from './dto/transaction.dto';
export declare class BalimesariService {
    private prisma;
    private eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    create(createDto: CreateBalimesariDto): Promise<{
        updatedAt: Date | null;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        nasabahId: number;
        tglBuka: Date;
        saldo: import("@prisma/client/runtime/library").Decimal;
        interestRate: import("@prisma/client/runtime/library").Decimal;
        status: string;
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
        nasabahId: number;
        tglBuka: Date;
        saldo: import("@prisma/client/runtime/library").Decimal;
        interestRate: import("@prisma/client/runtime/library").Decimal;
        status: string;
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
        nasabahId: number;
        tglBuka: Date;
        saldo: import("@prisma/client/runtime/library").Decimal;
        interestRate: import("@prisma/client/runtime/library").Decimal;
        status: string;
        noBalimesari: string;
    }>;
    setoran(noBalimesari: string, dto: BalimesariTransactionDto, userId: number): Promise<{
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
    penarikan(noBalimesari: string, dto: BalimesariTransactionDto, userId: number): Promise<{
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
    getTransactions(noBalimesari: string, page?: number, limit?: number): Promise<{
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
    voidTransaction(transId: number, txInput?: any): Promise<any>;
    closeAccount(noBalimesari: string, dto: {
        reason: string;
        penalty?: number;
        adminFee?: number;
    }, userId: number): Promise<{
        success: boolean;
        refund: number;
    }>;
}
