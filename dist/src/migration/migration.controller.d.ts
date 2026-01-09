import { Response } from 'express';
import { MigrationService } from './migration.service';
export declare class MigrationController {
    private readonly migrationService;
    constructor(migrationService: MigrationService);
    downloadJournalTemplate(res: Response): Promise<void>;
    uploadJournal(file: Express.Multer.File, journalDate: string, req: any): Promise<any>;
    previewJournal(file: Express.Multer.File, journalDate: string, redenominate: string): Promise<{
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
    confirmJournal(body: {
        data: any[];
        journalDate: string;
    }, req: any): Promise<any>;
    downloadNasabahTemplate(res: Response): Promise<void>;
    previewNasabah(file: Express.Multer.File): Promise<{
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
    confirmNasabah(body: {
        data: any[];
    }): Promise<{
        success: boolean;
        created: number;
        message: string;
    }>;
    uploadNasabah(file: Express.Multer.File): Promise<{
        success: boolean;
        totalProcessed: number;
        created: number;
        skipped: any;
        errors: {
            row: number;
            message: string;
        }[] | undefined;
    }>;
    downloadAnggotaTransactionTemplate(res: Response): Promise<void>;
    uploadAnggotaTransaction(file: Express.Multer.File): Promise<{
        success: boolean;
        total: number;
        imported: number;
        errors: {
            row: number;
            message: string;
        }[];
    }>;
    previewAnggota(file: Express.Multer.File, redenominate: string): Promise<{
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
    confirmAnggota(body: {
        data: any[];
    }): Promise<{
        success: boolean;
        imported: number;
        errors: any[];
    }>;
    downloadCoaTemplate(res: Response): Promise<void>;
    previewCoa(file: Express.Multer.File): Promise<{
        data: any[];
        summary: {
            totalRows: number;
            valid: number;
            duplicates: number;
            errors: number;
        };
    }>;
    confirmCoa(body: {
        data: any[];
    }): Promise<{
        success: boolean;
        imported: number;
        errors: any[];
    }>;
}
