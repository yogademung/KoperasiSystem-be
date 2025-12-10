import { PrismaService } from '../../database/prisma.service';
import { CreateDepositoDto } from './dto/create-deposito.dto';
export declare class DepositoService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createDto: CreateDepositoDto, userId: number): Promise<{
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        status: string;
        nasabahId: number;
        tglBuka: Date;
        noJangka: string;
        tglJatuhTempo: Date;
        nominal: import("@prisma/client/runtime/library").Decimal;
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
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        status: string;
        nasabahId: number;
        tglBuka: Date;
        noJangka: string;
        tglJatuhTempo: Date;
        nominal: import("@prisma/client/runtime/library").Decimal;
        bunga: import("@prisma/client/runtime/library").Decimal;
        payoutMode: string;
        targetAccountId: string | null;
    })[]>;
    findOne(noJangka: string): Promise<{
        accumulatedInterest: number;
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
            noJangka: string;
            nominal: import("@prisma/client/runtime/library").Decimal;
            keterangan: string | null;
            tipeTrans: string;
        }[];
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        status: string;
        nasabahId: number;
        tglBuka: Date;
        noJangka: string;
        tglJatuhTempo: Date;
        nominal: import("@prisma/client/runtime/library").Decimal;
        bunga: import("@prisma/client/runtime/library").Decimal;
        payoutMode: string;
        targetAccountId: string | null;
    }>;
    withdraw(noJangka: string, userId: number): Promise<{
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        status: string;
        nasabahId: number;
        tglBuka: Date;
        noJangka: string;
        tglJatuhTempo: Date;
        nominal: import("@prisma/client/runtime/library").Decimal;
        bunga: import("@prisma/client/runtime/library").Decimal;
        payoutMode: string;
        targetAccountId: string | null;
    }>;
}
