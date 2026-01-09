import { StartShiftDto, EndShiftDto } from './dto/collector-shift.dto';
import { PrismaService } from '../database/prisma.service';
import { AccountingService } from '../accounting/accounting.service';
import { SystemDateService } from '../system/system-date.service';
export declare class CollectorService {
    private prisma;
    private accountingService;
    private systemDateService;
    constructor(prisma: PrismaService, accountingService: AccountingService, systemDateService: SystemDateService);
    getDailyStats(userId: number, shiftStartTime?: Date): Promise<{
        todayTransactions: any;
        todayDeposits: number;
        todayWithdrawals: number;
    }>;
    private getStatsForModel;
    getActiveShift(userId: number): Promise<any>;
    startShift(userId: number, dto: StartShiftDto): Promise<any>;
    endShift(userId: number, dto: EndShiftDto): Promise<any>;
    private calculateDenominationTotal;
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
