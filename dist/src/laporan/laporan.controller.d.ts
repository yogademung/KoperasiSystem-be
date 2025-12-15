import type { Response } from 'express';
import { LaporanService } from './laporan.service';
export declare class LaporanController {
    private laporanService;
    constructor(laporanService: LaporanService);
    simpananRekap(params: {
        startDate: string;
        endDate: string;
        format: 'PDF' | 'EXCEL';
        regionCode?: string;
    }, res: Response): Promise<void>;
    tabrelaRekap(params: any, res: Response): Promise<void>;
    brahmacariRekap(params: any, res: Response): Promise<void>;
    balimesariRekap(params: any, res: Response): Promise<void>;
    wanaprastaRekap(params: any, res: Response): Promise<void>;
    depositoRekap(params: any, res: Response): Promise<void>;
    private parseDates;
    private handleReport;
}
