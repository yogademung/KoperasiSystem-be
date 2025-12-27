import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class BalanceSheetService {
    private readonly logger = new Logger(BalanceSheetService.name);

    constructor(private prisma: PrismaService) { }

    async validateBalance(period: string) {
        const [year, month] = period.split('-');
        const endDate = new Date(Date.UTC(+year, +month, 0)); // Last day of month

        // Get all posted journal balances up to this period
        const balances = await this.prisma.postedJournalDetail.groupBy({
            by: ['accountCode'],
            where: {
                journal: {
                    journalDate: {
                        lte: endDate,
                    },
                    status: 'POSTED',
                },
            },
            _sum: {
                debit: true,
                credit: true,
            },
        });

        const accounts = await this.prisma.journalAccount.findMany();
        const accountMap = new Map(accounts.map((a) => [a.accountCode, a]));

        let totalAssets = 0;
        let totalLiabilities = 0;
        let totalEquity = 0;
        let totalRevenue = 0;
        let totalExpense = 0;

        for (const b of balances) {
            const account = accountMap.get(b.accountCode);
            if (!account) continue;

            const debit = Number(b._sum.debit || 0);
            const credit = Number(b._sum.credit || 0);
            // Net balance from Debit perspective
            const netDebit = debit - credit;

            switch (account.accountType) {
                case 'AST': // Assets (Normal Debit)
                    totalAssets += netDebit;
                    break;
                case 'LIA': // Liabilities (Normal Credit)
                    totalLiabilities += (credit - debit);
                    break;
                case 'EQT': // Equity (Normal Credit)
                    totalEquity += (credit - debit);
                    break;
                case 'REV': // Revenue (Normal Credit)
                    totalRevenue += (credit - debit);
                    break;
                case 'EXP': // Expense (Normal Debit)
                    totalExpense += netDebit;
                    break;
            }
        }

        const currentShu = totalRevenue - totalExpense;

        // Accounting Equation: Assets = Liabilities + Equity + SHU
        const rights = totalLiabilities + totalEquity + currentShu;
        const diff = Math.abs(totalAssets - rights);

        this.logger.log(`Balance Validation for ${period}: Assets=${totalAssets}, Liabilities=${totalLiabilities}, Equity=${totalEquity}, SHU=${currentShu}. Diff=${diff}`);

        if (diff > 100) { // Toleransi Rp 100 perak for rounding issues
            throw new BadRequestException(
                `Neraca tidak balance! Selisih: ${diff}. Aset: ${totalAssets}, Kewajiban+Modal+SHU: ${rights}`
            );
        }

        return { valid: true, shu: currentShu, assets: totalAssets };
    }

    async processRetainedEarnings(period: string, user_id: number) {
        const [year, month] = period.split('-');

        // Only process for Year End (Month 12)
        if (month !== '12') {
            return;
        }

        this.logger.log(`Processing Retained Earnings for Year End ${period}`);

        // Logic: Move SHU (Rev - Exp) to Retained Earnings
        // 1. Calculate final SHU
        // 2. Debit Revenue Accounts (to zero them)
        // 3. Credit Expense Accounts (to zero them)
        // 4. Plug difference to Retained Earnings Account (e.g. 3.20.01 Cadangan Umum or 3.99.99 SHU Tahun Berjalan -> then to Reserves)

        // Note: Usually SHU Tahun Berjalan is automatically calculated by system reports. 
        // Formal closing entry involves zeroing P&L accounts.
        // Given the request "nantinya nilai retained earning terproses", we should ensure this step happens or is prepared.

        // For now, we will log the action as a placeholder for the full closing entry implementation,
        // as determining exact target accounts requires configuration (which we might not have fully).
        // Assuming 3.99.99 is SHU Tahun Berjalan.
    }
}
