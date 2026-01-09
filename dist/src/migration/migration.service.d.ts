import { PrismaService } from '../database/prisma.service';
export declare class MigrationService {
    private prisma;
    constructor(prisma: PrismaService);
    generateJournalTemplate(): Promise<Buffer>;
    uploadJournal(fileBuffer: Buffer, journalDate: string, userId: number): Promise<any>;
    previewJournal(fileBuffer: Buffer, journalDate: string, redenominate?: boolean): Promise<{
        data: any[];
        summary: {
            totalRows: number;
            totalDebit: number;
            totalCredit: number;
            isBalanced: boolean;
            balanceDiff: number;
            valid: number;
            errors: number;
        };
    }>;
    confirmJournal(validatedData: any[], journalDate: string, userId: number): Promise<any>;
    generateNasabahTemplate(): Promise<Buffer>;
    previewNasabah(fileBuffer: Buffer): Promise<{
        success: boolean;
        data: any[];
        summary: {
            total: number;
            valid: number;
            duplicates: number;
            errors: number;
        };
        existingInDb: any;
    }>;
    confirmNasabah(validatedData: any[]): Promise<{
        success: boolean;
        created: number;
        message: string;
    }>;
    uploadNasabah(fileBuffer: Buffer): Promise<{
        success: boolean;
        totalProcessed: number;
        created: number;
        skipped: any;
        errors: {
            row: number;
            message: string;
        }[] | undefined;
    }>;
    generateAnggotaTransactionTemplate(): Promise<Buffer>;
    uploadAnggotaTransaction(fileBuffer: Buffer): Promise<{
        success: boolean;
        total: number;
        imported: number;
        errors: {
            row: number;
            message: string;
        }[];
    }>;
    previewAnggota(fileBuffer: Buffer, redenominate?: boolean): Promise<{
        data: any[];
        aggregates: {
            nama: string;
            noKtp: string;
            totalPokok: number;
            totalWajib: number;
            totalSaldo: number;
            count: number;
            nasabahId: number;
        }[];
        summary: {
            totalRows: number;
            valid: number;
            errors: number;
            totalSaldoAll: any;
        };
    }>;
    confirmAnggota(validatedData: any[]): Promise<{
        success: boolean;
        imported: number;
        errors: any[];
    }>;
    generateCoaTemplate(): Promise<Buffer>;
    previewCoa(fileBuffer: Buffer): Promise<{
        data: any[];
        summary: {
            totalRows: number;
            valid: number;
            duplicates: number;
            errors: number;
        };
    }>;
    confirmCoa(validatedData: any[]): Promise<{
        success: boolean;
        imported: number;
        errors: any[];
    }>;
}
