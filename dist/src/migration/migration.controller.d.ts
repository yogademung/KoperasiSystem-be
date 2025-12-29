import { Response } from 'express';
import { MigrationService } from './migration.service';
export declare class MigrationController {
    private readonly migrationService;
    constructor(migrationService: MigrationService);
    downloadJournalTemplate(res: Response): Promise<void>;
    uploadJournal(file: Express.Multer.File, journalDate: string, req: any): Promise<{
        success: boolean;
        journalId: number;
        journalNumber: string;
        totalDebit: number;
        totalCredit: number;
        itemsCount: number;
    }>;
    downloadNasabahTemplate(res: Response): Promise<void>;
    uploadNasabah(file: Express.Multer.File): Promise<{
        success: boolean;
        totalProcessed: number;
        created: number;
        skipped: number;
        errors: {
            row: number;
            message: string;
        }[] | undefined;
    }>;
    downloadAnggotaTransactionTemplate(res: Response): Promise<void>;
    uploadAnggotaTransaction(file: Express.Multer.File): Promise<{
        success: boolean;
        totalRows: number;
        successCount: number;
        errors: {
            row: number;
            message: string;
        }[] | undefined;
    }>;
}
