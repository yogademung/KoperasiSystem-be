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
    create(createDto: CreateDepositoDto, req: any): Promise<{
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
    withdraw(noJangka: string, body: {
        penalty?: number;
        adminFee?: number;
        reason?: string;
    }, req: any): Promise<{
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
