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
                regionCode: string;
                isActive: boolean;
                createdBy: string;
                createdAt: Date;
                status: string;
                accountNumber: string;
                customerId: number;
                principal: import("@prisma/client/runtime/library").Decimal;
                mandatoryInit: import("@prisma/client/runtime/library").Decimal;
                openDate: Date;
                closeDate: Date | null;
                balance: import("@prisma/client/runtime/library").Decimal;
                groupCode: string;
                remark: string | null;
                deduction: import("@prisma/client/runtime/library").Decimal;
            }[];
            tabungan: {
                createdBy: string | null;
                createdAt: Date;
                updatedBy: string | null;
                updatedAt: Date | null;
                status: string;
                noTab: string;
                nasabahId: number;
                tglBuka: Date;
                saldo: import("@prisma/client/runtime/library").Decimal;
                interestRate: import("@prisma/client/runtime/library").Decimal;
            }[];
            deposito: {
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
            }[];
            brahmacari: {
                createdBy: string | null;
                createdAt: Date;
                updatedBy: string | null;
                updatedAt: Date | null;
                status: string;
                nasabahId: number;
                tglBuka: Date;
                saldo: import("@prisma/client/runtime/library").Decimal;
                interestRate: import("@prisma/client/runtime/library").Decimal;
                noBrahmacari: string;
            }[];
            balimesari: {
                createdBy: string | null;
                createdAt: Date;
                updatedBy: string | null;
                updatedAt: Date | null;
                status: string;
                nasabahId: number;
                tglBuka: Date;
                saldo: import("@prisma/client/runtime/library").Decimal;
                interestRate: import("@prisma/client/runtime/library").Decimal;
                noBalimesari: string;
            }[];
            wanaprasta: {
                createdBy: string | null;
                createdAt: Date;
                updatedBy: string | null;
                updatedAt: Date | null;
                status: string;
                nasabahId: number;
                tglBuka: Date;
                saldo: import("@prisma/client/runtime/library").Decimal;
                interestRate: import("@prisma/client/runtime/library").Decimal;
                noWanaprasta: string;
            }[];
        };
    }>;
    getWithdrawals(nasabahId: number): Promise<{
        id: number;
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date | null;
        status: string;
        nasabahId: number;
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
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date | null;
        status: string;
        nasabahId: number;
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
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date | null;
        status: string;
        nasabahId: number;
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
