import { PrismaService } from '../database/prisma.service';
export declare class MobileService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfileAndBalance(nasabahId: number): Promise<{
        nasabah: {
            id: number;
            nama: string;
            noKtp: string | null;
            alamat: string | null;
            email: string | null;
            telepon: string | null;
        };
        totalBalance: number;
        accounts: {
            anggota: {
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
            }[];
            tabungan: {
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
            }[];
            deposito: {
                updatedAt: Date | null;
                createdBy: string | null;
                createdAt: Date;
                updatedBy: string | null;
                nasabahId: number;
                tglBuka: Date;
                status: string;
                noJangka: string;
                tglJatuhTempo: Date;
                nominal: import("@prisma/client/runtime/library").Decimal;
                bunga: import("@prisma/client/runtime/library").Decimal;
                payoutMode: string;
                targetAccountId: string | null;
            }[];
            brahmacari: {
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
            }[];
            balimesari: {
                updatedAt: Date | null;
                createdBy: string | null;
                createdAt: Date;
                updatedBy: string | null;
                nasabahId: number;
                tglBuka: Date;
                saldo: import("@prisma/client/runtime/library").Decimal;
                interestRate: import("@prisma/client/runtime/library").Decimal;
                status: string;
                noBalimesari: string;
            }[];
            wanaprasta: {
                updatedAt: Date | null;
                createdBy: string | null;
                createdAt: Date;
                updatedBy: string | null;
                nasabahId: number;
                tglBuka: Date;
                saldo: import("@prisma/client/runtime/library").Decimal;
                interestRate: import("@prisma/client/runtime/library").Decimal;
                status: string;
                noWanaprasta: string;
            }[];
        };
    }>;
    getWithdrawals(nasabahId: number): Promise<{
        id: number;
        updatedAt: Date | null;
        createdBy: string | null;
        createdAt: Date;
        nasabahId: number;
        status: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        referenceNumber: string;
        fee: import("@prisma/client/runtime/library").Decimal;
        totalDeducted: import("@prisma/client/runtime/library").Decimal;
        deliveryAddress: string;
        scheduledDate: Date;
        timeSlot: string;
    }[]>;
    createWithdrawal(nasabahId: number, data: any): Promise<{
        id: number;
        updatedAt: Date | null;
        createdBy: string | null;
        createdAt: Date;
        nasabahId: number;
        status: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        referenceNumber: string;
        fee: import("@prisma/client/runtime/library").Decimal;
        totalDeducted: import("@prisma/client/runtime/library").Decimal;
        deliveryAddress: string;
        scheduledDate: Date;
        timeSlot: string;
    }>;
    getWithdrawal(nasabahId: number, id: number): Promise<{
        id: number;
        updatedAt: Date | null;
        createdBy: string | null;
        createdAt: Date;
        nasabahId: number;
        status: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        referenceNumber: string;
        fee: import("@prisma/client/runtime/library").Decimal;
        totalDeducted: import("@prisma/client/runtime/library").Decimal;
        deliveryAddress: string;
        scheduledDate: Date;
        timeSlot: string;
    }>;
    getTransactions(nasabahId: number): Promise<{
        id: string;
        date: Date;
        type: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        description: string;
        source: string;
    }[]>;
}
