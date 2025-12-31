"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BalanceSheetService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceSheetService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let BalanceSheetService = BalanceSheetService_1 = class BalanceSheetService {
    prisma;
    logger = new common_1.Logger(BalanceSheetService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async validateBalance(period) {
        const [year, month] = period.split('-');
        const endDate = new Date(Date.UTC(+year, +month, 0));
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
            if (!account)
                continue;
            const debit = Number(b._sum.debit || 0);
            const credit = Number(b._sum.credit || 0);
            const netDebit = debit - credit;
            switch (account.accountType) {
                case 'AST':
                    totalAssets += netDebit;
                    break;
                case 'LIA':
                    totalLiabilities += (credit - debit);
                    break;
                case 'EQT':
                    totalEquity += (credit - debit);
                    break;
                case 'REV':
                    totalRevenue += (credit - debit);
                    break;
                case 'EXP':
                    totalExpense += netDebit;
                    break;
            }
        }
        const currentShu = totalRevenue - totalExpense;
        const rights = totalLiabilities + totalEquity + currentShu;
        const diff = Math.abs(totalAssets - rights);
        this.logger.log(`Balance Validation for ${period}: Assets=${totalAssets}, Liabilities=${totalLiabilities}, Equity=${totalEquity}, SHU=${currentShu}. Diff=${diff}`);
        if (diff > 100) {
            throw new common_1.BadRequestException(`Neraca tidak balance! Selisih: ${diff}. Aset: ${totalAssets}, Kewajiban+Modal+SHU: ${rights}`);
        }
        return { valid: true, shu: currentShu, assets: totalAssets };
    }
    async processRetainedEarnings(period, user_id) {
        const [year, month] = period.split('-');
        if (month !== '12') {
            return;
        }
        this.logger.log(`Processing Retained Earnings for Year End ${period}`);
        const revenueAccounts = await this.prisma.journalAccount.findMany({ where: { accountType: 'REV' } });
        const expenseAccounts = await this.prisma.journalAccount.findMany({ where: { accountType: 'EXP' } });
        const revCodes = revenueAccounts.map(a => a.accountCode);
        const expCodes = expenseAccounts.map(a => a.accountCode);
        const allPnLCodes = [...revCodes, ...expCodes];
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
        const details = [];
        let totalRevenue = 0;
        let totalExpense = 0;
        for (const b of balances) {
            const debit = Number(b._sum.debit || 0);
            const credit = Number(b._sum.credit || 0);
            const netBalance = credit - debit;
            if (revCodes.includes(b.accountCode)) {
                const balance = credit - debit;
                if (balance !== 0) {
                    details.push({
                        accountCode: b.accountCode,
                        debit: balance,
                        credit: 0,
                        description: `Closing Entry ${year}`
                    });
                    totalRevenue += balance;
                }
            }
            else if (expCodes.includes(b.accountCode)) {
                const balance = debit - credit;
                if (balance !== 0) {
                    details.push({
                        accountCode: b.accountCode,
                        debit: 0,
                        credit: balance,
                        description: `Closing Entry ${year}`
                    });
                    totalExpense += balance;
                }
            }
        }
        const currentSHU = totalRevenue - totalExpense;
        if (currentSHU > 0) {
            details.push({
                accountCode: '3.20.01',
                debit: 0,
                credit: currentSHU,
                description: `Allocation of SHU ${year}`
            });
        }
        else if (currentSHU < 0) {
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
        await this.prisma.postedJournal.create({
            data: {
                journalNumber: `CL/${year}/12/0001`,
                journalDate: new Date(`${year}-12-31`),
                description: `Year End Closing ${year}`,
                postingType: 'sys_CLOSING',
                userId: user_id,
                status: 'POSTED',
                details: {
                    create: details
                }
            }
        });
        this.logger.log(`Year End Closing Journal Created for ${year}. SHU: ${currentSHU}`);
    }
};
exports.BalanceSheetService = BalanceSheetService;
exports.BalanceSheetService = BalanceSheetService = BalanceSheetService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BalanceSheetService);
//# sourceMappingURL=balance-sheet.service.js.map