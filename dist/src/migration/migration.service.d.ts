import { PrismaService } from '../database/prisma.service';
export declare class MigrationService {
    private prisma;
    constructor(prisma: PrismaService);
    generateJournalTemplate(): Promise<Buffer>;
    uploadJournal(fileBuffer: Buffer, journalDate: string, userId: number): Promise<{
        success: boolean;
        journalId: number;
        journalNumber: string;
        totalDebit: number;
        totalCredit: number;
        itemsCount: number;
    }>;
    generateNasabahTemplate(): Promise<Buffer>;
    uploadNasabah(fileBuffer: Buffer): Promise<{
        success: boolean;
        totalProcessed: number;
        created: number;
        skipped: number;
        errors: {
            row: number;
            message: string;
        }[] | undefined;
    }>;
    generateAnggotaTransactionTemplate(): Promise<Buffer>;
    uploadAnggotaTransaction(fileBuffer: Buffer): Promise<{
        success: boolean;
        totalRows: number;
        successCount: number;
        errors: {
            row: number;
            message: string;
        }[] | undefined;
    }>;
}
