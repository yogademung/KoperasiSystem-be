import { AnggotaService } from './anggota.service';
import { CreateAnggotaDto } from './dto/create-anggota.dto';
import { SetoranDto } from './dto/setoran.dto';
export declare class AnggotaController {
    private readonly anggotaService;
    constructor(anggotaService: AnggotaService);
    create(dto: CreateAnggotaDto, req: any): Promise<{
        customer: {
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
    } & {
        regionCode: string;
        isActive: boolean;
        createdBy: string;
        createdAt: Date;
        accountNumber: string;
        customerId: number;
        principal: import("@prisma/client/runtime/library").Decimal;
        mandatoryInit: import("@prisma/client/runtime/library").Decimal;
        openDate: Date;
        closeDate: Date | null;
        balance: import("@prisma/client/runtime/library").Decimal;
        status: string;
        groupCode: string;
        remark: string | null;
        deduction: import("@prisma/client/runtime/library").Decimal;
    }>;
    findAll(): Promise<({
        customer: {
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
    } & {
        regionCode: string;
        isActive: boolean;
        createdBy: string;
        createdAt: Date;
        accountNumber: string;
        customerId: number;
        principal: import("@prisma/client/runtime/library").Decimal;
        mandatoryInit: import("@prisma/client/runtime/library").Decimal;
        openDate: Date;
        closeDate: Date | null;
        balance: import("@prisma/client/runtime/library").Decimal;
        status: string;
        groupCode: string;
        remark: string | null;
        deduction: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    findOne(accountNumber: string): Promise<{
        customer: {
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
            createdAt: Date;
            description: string | null;
            accountNumber: string;
            transType: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            transDate: Date;
            balanceAfter: import("@prisma/client/runtime/library").Decimal;
            userId: number;
        }[];
    } & {
        regionCode: string;
        isActive: boolean;
        createdBy: string;
        createdAt: Date;
        accountNumber: string;
        customerId: number;
        principal: import("@prisma/client/runtime/library").Decimal;
        mandatoryInit: import("@prisma/client/runtime/library").Decimal;
        openDate: Date;
        closeDate: Date | null;
        balance: import("@prisma/client/runtime/library").Decimal;
        status: string;
        groupCode: string;
        remark: string | null;
        deduction: import("@prisma/client/runtime/library").Decimal;
    }>;
    setoran(accountNumber: string, dto: SetoranDto, req: any): Promise<{
        success: boolean;
    }>;
    getTransactions(accountNumber: string, page?: number, limit?: number): Promise<{
        data: {
            id: number;
            createdAt: Date;
            description: string | null;
            accountNumber: string;
            transType: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            transDate: Date;
            balanceAfter: import("@prisma/client/runtime/library").Decimal;
            userId: number;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
