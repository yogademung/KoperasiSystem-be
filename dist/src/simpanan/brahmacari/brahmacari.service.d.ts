import { PrismaService } from '../../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateBrahmacariDto } from './dto/create-brahmacari.dto';
import { BrahmacariTransactionDto } from './dto/transaction.dto';
export declare class BrahmacariService {
    private prisma;
    private eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    create(createDto: CreateBrahmacariDto): Promise<{
        updatedAt: Date | null;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        nasabahId: number;
        tglBuka: Date;
        saldo: import("@prisma/client/runtime/library").Decimal;
        interestRate: import("@prisma/client/runtime/library").Decimal;
        status: string;
        noBrahmacari: string;
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
        noBrahmacari: string;
    })[]>;
    findOne(noBrahmacari: string): Promise<{
        nasabah: {
            id: number;
            updatedAt: Date | null;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
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
        };
        transactions: {
            id: number;
            createdBy: string | null;
            createdAt: Date;
            nominal: import("@prisma/client/runtime/library").Decimal;
            noBrahmacari: string;
            tipeTrans: string;
            saldoAkhir: import("@prisma/client/runtime/library").Decimal;
            keterangan: string | null;
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
        noBrahmacari: string;
    }>;
    setoran(noBrahmacari: string, dto: BrahmacariTransactionDto, userId: number): Promise<{
        id: number;
        createdBy: string | null;
        createdAt: Date;
        nominal: import("@prisma/client/runtime/library").Decimal;
        noBrahmacari: string;
        tipeTrans: string;
        saldoAkhir: import("@prisma/client/runtime/library").Decimal;
        keterangan: string | null;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    penarikan(noBrahmacari: string, dto: BrahmacariTransactionDto, userId: number): Promise<{
        id: number;
        createdBy: string | null;
        createdAt: Date;
        nominal: import("@prisma/client/runtime/library").Decimal;
        noBrahmacari: string;
        tipeTrans: string;
        saldoAkhir: import("@prisma/client/runtime/library").Decimal;
        keterangan: string | null;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    getTransactions(noBrahmacari: string, page?: number, limit?: number): Promise<{
        data: {
            id: number;
            createdBy: string | null;
            createdAt: Date;
            nominal: import("@prisma/client/runtime/library").Decimal;
            noBrahmacari: string;
            tipeTrans: string;
            saldoAkhir: import("@prisma/client/runtime/library").Decimal;
            keterangan: string | null;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    voidTransaction(transId: number, txInput?: any): Promise<any>;
    closeAccount(noBrahmacari: string, dto: {
        reason: string;
        penalty?: number;
        adminFee?: number;
    }, userId: number): Promise<{
        success: boolean;
        refund: number;
    }>;
}
