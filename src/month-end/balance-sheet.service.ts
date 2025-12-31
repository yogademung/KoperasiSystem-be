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

        // 1. Calculate Revenue & Expense Balances
        const revenueAccounts = await this.prisma.journalAccount.findMany({ where: { accountType: 'REV' } });
        const expenseAccounts = await this.prisma.journalAccount.findMany({ where: { accountType: 'EXP' } });

        const revCodes = revenueAccounts.map(a => a.accountCode);
        const expCodes = expenseAccounts.map(a => a.accountCode);
        const allPnLCodes = [...revCodes, ...expCodes];

        // Group balances by account
        const balances = await this.prisma.postedJournalDetail.groupBy({
            by: ['accountCode'],
            where: {
                accountCode: { in: allPnLCodes },
                journal: {
                    journalDate: { lte: new Date(`${year}-12-31`) },
                    status: 'POSTED'
                }
            },
            _sum: { debit: true, credit: true }
        });

        // 2. Prepare Closing Journal Details
        const details = [];
        let totalRevenue = 0;
        let totalExpense = 0;

        for (const b of balances) {
            const debit = Number(b._sum.debit || 0);
            const credit = Number(b._sum.credit || 0);
            const netBalance = credit - debit; // Normal Credit for Rev, check logic below

            // If Revenue (Credit Balance), we Debit it to zero out
            // If Expense (Debit Balance), we Credit it to zero out
            // Since we treat Net = Credit - Debit:
            // Positive Net = Validation Credit Side > Debit Side (Revenue)
            // Negative Net = Debit Side > Credit Side (Expense)

            if (revCodes.includes(b.accountCode)) {
                // REVENUE: Normal Credit. To close, we DEBIT the balance.
                // Balance = Credit - Debit
                const balance = credit - debit;
                if (balance !== 0) {
                    details.push({
                        accountCode: b.accountCode,
                        debit: balance, // Debit the credit balance
                        credit: 0,
                        description: `Closing Entry ${year}`
                    });
                    totalRevenue += balance;
                }
            } else if (expCodes.includes(b.accountCode)) {
                // EXPENSE: Normal Debit. To close, we CREDIT the balance.
                // Balance = Debit - Credit
                const balance = debit - credit;
                if (balance !== 0) {
                    details.push({
                        accountCode: b.accountCode,
                        debit: 0,
                        credit: balance, // Credit the debit balance
                        description: `Closing Entry ${year}`
                    });
                    totalExpense += balance;
                }
            }
        }

        // 3. Calculate SHU (Profit/Loss)
        const currentSHU = totalRevenue - totalExpense;

        // 4. Post Difference to Retained Earnings / Cadangan
        // Using 3.20.01 (Cadangan Umum) based on script finding. 
        // Or 3.99.99 (SHU Tahun Berjalan) if we want just to transit. 
        // Plan said 3.20.01
        if (currentSHU > 0) {
            // Profit: Revenue > Expense. Need to CREDIT Equity (Increase it)
            // Journal is currently: Debited Revenues, Credited Expenses.
            // Sum Debits = TotalRevenue. Sum Credits = TotalExpense.
            // Missing Credit = TotalRevenue - TotalExpense = SHU
            details.push({
                accountCode: '3.20.01',
                debit: 0,
                credit: currentSHU,
                description: `Allocation of SHU ${year}`
            });
        } else if (currentSHU < 0) {
            // Loss: Expense > Revenue. Need to DEBIT Equity (Decrease it)
            // Missing Debit = TotalExpense - TotalRevenue = -SHU
            details.push({
                accountCode: '3.20.01',
                debit: Math.abs(currentSHU),
                credit: 0,
                description: `Allocation of Loss ${year}`
            });
        }

        if (details.length === 0) {
            this.logger.log(`No P&L activity to close for ${year}`);
            return;
        }

        // 5. Create Journal
        await this.prisma.postedJournal.create({
            data: {
                journalNumber: `CL/${year}/12/0001`, // Special Numbering
                journalDate: new Date(`${year}-12-31`),
                description: `Year End Closing ${year}`,
                postingType: 'sys_CLOSING', // Distinct type
                userId: user_id,
                status: 'POSTED',
                details: {
                    create: details
                }
            }
        });

        this.logger.log(`Year End Closing Journal Created for ${year}. SHU: ${currentSHU}`);
    }
}
