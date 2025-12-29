import { PrismaService } from '../../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateDepositoDto } from './dto/create-deposito.dto';
export declare class DepositoService {
    private prisma;
    private eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    create(createDto: CreateDepositoDto, userId: number): Promise<{
        updatedAt: Date | null;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        status: string;
        nominal: import("@prisma/client/runtime/library").Decimal;
        nasabahId: number;
        tglBuka: Date;
        noJangka: string;
        tglJatuhTempo: Date;
        bunga: import("@prisma/client/runtime/library").Decimal;
        payoutMode: string;
        targetAccountId: string | null;
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
        nominal: import("@prisma/client/runtime/library").Decimal;
        nasabahId: number;
        tglBuka: Date;
        noJangka: string;
        tglJatuhTempo: Date;
        bunga: import("@prisma/client/runtime/library").Decimal;
        payoutMode: string;
        targetAccountId: string | null;
    })[]>;
    getTransactions(noJangka: string, page?: number, limit?: number): Promise<{
        data: {
            id: number;
            createdBy: string | null;
            createdAt: Date;
            nominal: import("@prisma/client/runtime/library").Decimal;
            noJangka: string;
            keterangan: string | null;
            tipeTrans: string;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    voidTransaction(transId: number, txInput?: any): Promise<void>;
    findOne(noJangka: string): Promise<{
        accumulatedInterest: number;
        transactions: {
            id: number;
            createdBy: string | null;
            createdAt: Date;
            nominal: import("@prisma/client/runtime/library").Decimal;
            noJangka: string;
            keterangan: string | null;
            tipeTrans: string;
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
        updatedAt: Date | null;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        status: string;
        nominal: import("@prisma/client/runtime/library").Decimal;
        nasabahId: number;
        tglBuka: Date;
        noJangka: string;
        tglJatuhTempo: Date;
        bunga: import("@prisma/client/runtime/library").Decimal;
        payoutMode: string;
        targetAccountId: string | null;
    }>;
    withdraw(noJangka: string, userId: number, options?: {
        penalty?: number;
        adminFee?: number;
        reason?: string;
    }): Promise<{
        updatedAt: Date | null;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        status: string;
        nominal: import("@prisma/client/runtime/library").Decimal;
        nasabahId: number;
        tglBuka: Date;
        noJangka: string;
        tglJatuhTempo: Date;
        bunga: import("@prisma/client/runtime/library").Decimal;
        payoutMode: string;
        targetAccountId: string | null;
    }>;
}
