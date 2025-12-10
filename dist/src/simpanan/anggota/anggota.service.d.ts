import { PrismaService } from '../../database/prisma.service';
import { CreateAnggotaDto } from './dto/create-anggota.dto';
import { SetoranDto } from './dto/setoran.dto';
export declare class AnggotaService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateAnggotaDto, userId: number): Promise<{
        customer: {
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
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
            updatedBy: string | null;
            updatedAt: Date | null;
        };
    } & {
        accountNumber: string;
        customerId: number;
        principal: import("@prisma/client/runtime/library").Decimal;
        mandatoryInit: import("@prisma/client/runtime/library").Decimal;
        openDate: Date;
        closeDate: Date | null;
        balance: import("@prisma/client/runtime/library").Decimal;
        status: string;
        regionCode: string;
        groupCode: string;
        remark: string | null;
        deduction: import("@prisma/client/runtime/library").Decimal;
        isActive: boolean;
        createdBy: string;
        createdAt: Date;
    }>;
    findAll(): Promise<({
        customer: {
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
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
            updatedBy: string | null;
            updatedAt: Date | null;
        };
    } & {
        accountNumber: string;
        customerId: number;
        principal: import("@prisma/client/runtime/library").Decimal;
        mandatoryInit: import("@prisma/client/runtime/library").Decimal;
        openDate: Date;
        closeDate: Date | null;
        balance: import("@prisma/client/runtime/library").Decimal;
        status: string;
        regionCode: string;
        groupCode: string;
        remark: string | null;
        deduction: import("@prisma/client/runtime/library").Decimal;
        isActive: boolean;
        createdBy: string;
        createdAt: Date;
    })[]>;
    findOne(accountNumber: string): Promise<{
        customer: {
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
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
            updatedBy: string | null;
            updatedAt: Date | null;
        };
        transactions: {
            transType: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            description: string | null;
            accountNumber: string;
            createdAt: Date;
            transDate: Date;
            id: number;
            balanceAfter: import("@prisma/client/runtime/library").Decimal;
            userId: number;
        }[];
    } & {
        accountNumber: string;
        customerId: number;
        principal: import("@prisma/client/runtime/library").Decimal;
        mandatoryInit: import("@prisma/client/runtime/library").Decimal;
        openDate: Date;
        closeDate: Date | null;
        balance: import("@prisma/client/runtime/library").Decimal;
        status: string;
        regionCode: string;
        groupCode: string;
        remark: string | null;
        deduction: import("@prisma/client/runtime/library").Decimal;
        isActive: boolean;
        createdBy: string;
        createdAt: Date;
    }>;
    setoran(accountNumber: string, dto: SetoranDto, userId: number): Promise<{
        success: boolean;
    }>;
    penarikan(accountNumber: string, dto: SetoranDto, userId: number): Promise<{
        success: boolean;
    }>;
    getTransactions(accountNumber: string, page?: number, limit?: number): Promise<{
        data: {
            transType: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            description: string | null;
            accountNumber: string;
            createdAt: Date;
            transDate: Date;
            id: number;
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
}
