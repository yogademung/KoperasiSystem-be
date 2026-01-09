import { CollectorService } from './collector.service';
import { StartShiftDto, EndShiftDto } from './dto/collector-shift.dto';
export declare class CollectorController {
    private readonly collectorService;
    constructor(collectorService: CollectorService);
    getStats(req: any): Promise<{
        todayTransactions: any;
        todayDeposits: number;
        todayWithdrawals: number;
    }>;
    getActiveShift(req: any): Promise<any>;
    startShift(req: any, dto: StartShiftDto): Promise<any>;
    endShift(req: any, dto: EndShiftDto): Promise<any>;
    getFlashSummary(): Promise<{
        activeCollectors: any;
        totalCashInHand: any;
        totalDeposits: number;
        totalWithdrawals: number;
        totalTransactions: number;
        collectors: {
            name: string;
            cashInHand: number;
            shiftStartTime: Date;
            deposits: number;
            withdrawals: number;
            transactions: number;
        }[];
        closedShifts: any;
    }>;
}
