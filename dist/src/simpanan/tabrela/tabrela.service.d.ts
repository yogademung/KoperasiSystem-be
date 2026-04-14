import { PrismaService } from '../../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateTabrelaDto } from './dto/create-tabrela.dto';
export declare class TabrelaService {
    private prisma;
    private eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    create(createDto: CreateTabrelaDto): Promise<{
        updatedAt: Date | null;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        noTab: string;
        nasabahId: number;
        tglBuka: Date;
        saldo: import("@prisma/client/runtime/library").Decimal;
        interestRate: import("@prisma/client/runtime/library").Decimal;
        status: string;
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
        noTab: string;
        nasabahId: number;
        tglBuka: Date;
        saldo: import("@prisma/client/runtime/library").Decimal;
        interestRate: import("@prisma/client/runtime/library").Decimal;
        status: string;
    })[]>;
    findOne(noTab: string): Promise<{
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
            noTab: string;
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
        noTab: string;
        nasabahId: number;
        tglBuka: Date;
        saldo: import("@prisma/client/runtime/library").Decimal;
        interestRate: import("@prisma/client/runtime/library").Decimal;
        status: string;
    }>;
    setoran(noTab: string, dto: {
        amount: number;
        description?: string;
        transType?: string;
    }, userId?: any): Promise<{
        success: boolean;
    }>;
    penarikan(noTab: string, dto: {
        amount: number;
        description?: string;
    }, userId?: any): Promise<{
        success: boolean;
    }>;
    voidTransaction(transId: number, txInput?: any): Promise<any>;
    closeAccount(noTab: string, dto: {
        reason: string;
        penalty?: number;
        adminFee?: number;
    }, userId?: number): Promise<{
        success: boolean;
        refund: number;
    }>;
}
