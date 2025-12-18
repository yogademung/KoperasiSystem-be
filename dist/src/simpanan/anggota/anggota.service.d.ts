import { PrismaService } from '../../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateAnggotaDto } from './dto/create-anggota.dto';
import { SetoranDto } from './dto/setoran.dto';
export declare class AnggotaService {
    private prisma;
    private eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    create(dto: CreateAnggotaDto, userId: number): Promise<{
        customer: {
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
        remark: string | null;
        isActive: boolean;
        createdBy: string;
        createdAt: Date;
        regionCode: string;
        status: string;
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
        remark: string | null;
        isActive: boolean;
        createdBy: string;
        createdAt: Date;
        regionCode: string;
        status: string;
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
        transactions: {
            createdAt: Date;
            id: number;
            transType: string;
            description: string | null;
            accountNumber: string;
            transDate: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            balanceAfter: import("@prisma/client/runtime/library").Decimal;
            userId: number;
        }[];
        customer: {
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
        remark: string | null;
        isActive: boolean;
        createdBy: string;
        createdAt: Date;
        regionCode: string;
        status: string;
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
    getTransactions(accountNumber: string, page?: number, limit?: number): Promise<{
        data: {
            createdAt: Date;
            id: number;
            transType: string;
            description: string | null;
            accountNumber: string;
            transDate: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            balanceAfter: import("@prisma/client/runtime/library").Decimal;
            userId: number;
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
