import { PrismaService } from '../../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateAnggotaDto } from './dto/create-anggota.dto';
import { SetoranDto } from './dto/setoran.dto';
import { TutupAnggotaDto } from './dto/tutup-anggota.dto';
export declare class AnggotaService {
    private prisma;
    private eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    create(dto: CreateAnggotaDto, userId: number): Promise<{
        customer: {
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
    } & {
        remark: string | null;
        isActive: boolean;
        createdBy: string;
        createdAt: Date;
        status: string;
        regionCode: string;
        accountNumber: string;
        customerId: number;
        principal: import("@prisma/client/runtime/library").Decimal;
        mandatoryInit: import("@prisma/client/runtime/library").Decimal;
        openDate: Date;
        closeDate: Date | null;
        balance: import("@prisma/client/runtime/library").Decimal;
        groupCode: string;
        deduction: import("@prisma/client/runtime/library").Decimal;
    }>;
    findAll(): Promise<({
        customer: {
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
    } & {
        remark: string | null;
        isActive: boolean;
        createdBy: string;
        createdAt: Date;
        status: string;
        regionCode: string;
        accountNumber: string;
        customerId: number;
        principal: import("@prisma/client/runtime/library").Decimal;
        mandatoryInit: import("@prisma/client/runtime/library").Decimal;
        openDate: Date;
        closeDate: Date | null;
        balance: import("@prisma/client/runtime/library").Decimal;
        groupCode: string;
        deduction: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    findOne(accountNumber: string): Promise<{
        customer: {
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
            transType: string;
            description: string | null;
            createdAt: Date;
            userId: number;
            accountNumber: string;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            transDate: Date;
            balanceAfter: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        remark: string | null;
        isActive: boolean;
        createdBy: string;
        createdAt: Date;
        status: string;
        regionCode: string;
        accountNumber: string;
        customerId: number;
        principal: import("@prisma/client/runtime/library").Decimal;
        mandatoryInit: import("@prisma/client/runtime/library").Decimal;
        openDate: Date;
        closeDate: Date | null;
        balance: import("@prisma/client/runtime/library").Decimal;
        groupCode: string;
        deduction: import("@prisma/client/runtime/library").Decimal;
    }>;
    setoran(accountNumber: string, dto: SetoranDto, userId: number): Promise<{
        success: boolean;
    }>;
    penarikan(accountNumber: string, dto: SetoranDto, userId: number): Promise<{
        success: boolean;
    }>;
    closeAccount(accountNumber: string, dto: TutupAnggotaDto, userId: number): Promise<{
        success: boolean;
        refundAmount: number;
        message: string;
    }>;
    getTransactions(accountNumber: string, page?: number, limit?: number): Promise<{
        data: {
            id: number;
            transType: string;
            description: string | null;
            createdAt: Date;
            userId: number;
            accountNumber: string;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            transDate: Date;
            balanceAfter: import("@prisma/client/runtime/library").Decimal;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    private createTransaction;
    private generateAccountNumber;
    voidTransaction(transId: number, txInput?: any): Promise<any>;
}
