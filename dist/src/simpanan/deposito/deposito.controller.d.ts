import { DepositoService } from './deposito.service';
import { CreateDepositoDto } from './dto/create-deposito.dto';
import { SimpananInterestService } from '../simpanan-interest.service';
export declare class DepositoController {
    private readonly depositoService;
    private readonly interestService;
    constructor(depositoService: DepositoService, interestService: SimpananInterestService);
    testInterest(): Promise<{
        message: string;
    }>;
    getSimulation(noJangka: string): Promise<{
        noJangka: string;
        nama: string;
        nominal: import("@prisma/client/runtime/library").Decimal;
        rate: import("@prisma/client/runtime/library").Decimal;
        grossInterest: number;
        tax: number;
        netInterest: number;
        payoutMode: string;
        targetAccountId: string | null;
    }>;
    findAll(): Promise<({
        nasabah: {
            nama: string;
            noKtp: string | null;
        };
    } & {
        noJangka: string;
        nasabahId: number;
        tglBuka: Date;
        tglJatuhTempo: Date;
        nominal: import("@prisma/client/runtime/library").Decimal;
        bunga: import("@prisma/client/runtime/library").Decimal;
        payoutMode: string;
        targetAccountId: string | null;
        status: string;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
    })[]>;
    findOne(noJangka: string): Promise<{
        accumulatedInterest: number;
        nasabah: {
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            id: number;
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
            isActive: boolean;
        };
        transactions: {
            noJangka: string;
            nominal: import("@prisma/client/runtime/library").Decimal;
            createdBy: string | null;
            createdAt: Date;
            id: number;
            tipeTrans: string;
            keterangan: string | null;
        }[];
        noJangka: string;
        nasabahId: number;
        tglBuka: Date;
        tglJatuhTempo: Date;
        nominal: import("@prisma/client/runtime/library").Decimal;
        bunga: import("@prisma/client/runtime/library").Decimal;
        payoutMode: string;
        targetAccountId: string | null;
        status: string;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
    }>;
    create(createDto: CreateDepositoDto, req: any): Promise<{
        noJangka: string;
        nasabahId: number;
        tglBuka: Date;
        tglJatuhTempo: Date;
        nominal: import("@prisma/client/runtime/library").Decimal;
        bunga: import("@prisma/client/runtime/library").Decimal;
        payoutMode: string;
        targetAccountId: string | null;
        status: string;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
    }>;
    withdraw(noJangka: string, req: any): Promise<{
        noJangka: string;
        nasabahId: number;
        tglBuka: Date;
        tglJatuhTempo: Date;
        nominal: import("@prisma/client/runtime/library").Decimal;
        bunga: import("@prisma/client/runtime/library").Decimal;
        payoutMode: string;
        targetAccountId: string | null;
        status: string;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
    }>;
}
