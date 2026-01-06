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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectorService = void 0;
const common_1 = require("@nestjs/common");
const accounting_service_1 = require("../accounting/accounting.service");
const prisma_service_1 = require("../database/prisma.service");
const date_fns_1 = require("date-fns");
let CollectorService = class CollectorService {
    prisma;
    accountingService;
    constructor(prisma, accountingService) {
        this.prisma = prisma;
        this.accountingService = accountingService;
    }
    async getDailyStats(userId) {
        const todayStart = (0, date_fns_1.startOfDay)(new Date());
        const todayEnd = (0, date_fns_1.endOfDay)(new Date());
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            console.log(`User not found for ID: ${userId}`);
            return { todayTransactions: 0, todayDeposits: 0, todayWithdrawals: 0 };
        }
        const username = user.username;
        const anggotaStats = await this.getStatsForModel(this.prisma.anggotaTransaction, {
            userId: userId,
            transDate: { gte: todayStart, lte: todayEnd }
        }, 'AnggotaTransaction', 'amount', 'transType');
        const tabStats = await this.getStatsForModel(this.prisma.transTab, {
            createdBy: username,
            createdAt: { gte: todayStart, lte: todayEnd }
        }, 'TransTab', 'nominal', 'tipeTrans');
        const brahmacariStats = await this.getStatsForModel(this.prisma.transBrahmacari, {
            createdBy: username,
            createdAt: { gte: todayStart, lte: todayEnd }
        }, 'TransBrahmacari', 'nominal', 'tipeTrans');
        const balimesariStats = await this.getStatsForModel(this.prisma.transBalimesari, {
            createdBy: username,
            createdAt: { gte: todayStart, lte: todayEnd }
        }, 'TransBalimesari', 'nominal', 'tipeTrans');
        const wanaprastaStats = await this.getStatsForModel(this.prisma.transWanaprasta, {
            createdBy: username,
            createdAt: { gte: todayStart, lte: todayEnd }
        }, 'TransWanaprasta', 'nominal', 'tipeTrans');
        const allStats = [anggotaStats, tabStats, brahmacariStats, balimesariStats, wanaprastaStats];
        return allStats.reduce((acc, curr) => ({
            todayTransactions: acc.todayTransactions + curr.count,
            todayDeposits: acc.todayDeposits + curr.deposits,
            todayWithdrawals: acc.todayWithdrawals + curr.withdrawals
        }), { todayTransactions: 0, todayDeposits: 0, todayWithdrawals: 0 });
    }
    async getStatsForModel(model, whereClause, modelName, amountField = 'amount', typeField = 'transType') {
        if (!model)
            return { count: 0, deposits: 0, withdrawals: 0 };
        if (typeof model.findMany !== 'function')
            return { count: 0, deposits: 0, withdrawals: 0 };
        try {
            const selectObj = {};
            selectObj[amountField] = true;
            selectObj[typeField] = true;
            const txs = await model.findMany({
                where: whereClause,
                select: selectObj
            });
            let deposits = 0;
            let withdrawals = 0;
            txs.forEach((t) => {
                const amt = Number(t[amountField] || 0);
                if (amt < 0) {
                    withdrawals += Math.abs(amt);
                }
                else {
                    deposits += amt;
                }
            });
            return { count: txs.length, deposits, withdrawals };
        }
        catch (error) {
            console.error(`Error fetching stats for ${modelName}:`, error);
            return { count: 0, deposits: 0, withdrawals: 0 };
        }
    }
    async getDailyTransactions(userId) {
        const todayStart = (0, date_fns_1.startOfDay)(new Date());
        const todayEnd = (0, date_fns_1.endOfDay)(new Date());
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return [];
        }
        const username = user.username;
        const transactions = [];
        const anggotaTxs = await this.prisma.anggotaTransaction.findMany({
            where: {
                userId: userId,
                transDate: { gte: todayStart, lte: todayEnd }
            },
            include: {
                account: {
                    include: {
                        customer: {
                            select: { nama: true }
                        }
                    }
                }
            },
            orderBy: { transDate: 'desc' }
        });
        anggotaTxs.forEach(tx => {
            transactions.push({
                id: `anggota-${tx.id}`,
                productType: 'Anggota',
                accountNumber: tx.accountNumber,
                accountName: tx.account.customer.nama,
                transType: tx.transType,
                amount: Number(tx.amount),
                timestamp: tx.transDate,
                description: tx.description
            });
        });
        const tabTxs = await this.prisma.transTab.findMany({
            where: {
                createdBy: username,
                createdAt: { gte: todayStart, lte: todayEnd }
            },
            include: {
                tabungan: {
                    include: {
                        nasabah: {
                            select: { nama: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        tabTxs.forEach(tx => {
            transactions.push({
                id: `tab-${tx.id}`,
                productType: 'Tabrela',
                accountNumber: tx.noTab,
                accountName: tx.tabungan.nasabah.nama,
                transType: tx.tipeTrans,
                amount: Number(tx.nominal),
                timestamp: tx.createdAt,
                description: tx.keterangan
            });
        });
        const brahmacariTxs = await this.prisma.transBrahmacari.findMany({
            where: {
                createdBy: username,
                createdAt: { gte: todayStart, lte: todayEnd }
            },
            include: {
                brahmacari: {
                    include: {
                        nasabah: {
                            select: { nama: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        brahmacariTxs.forEach(tx => {
            transactions.push({
                id: `brahmacari-${tx.id}`,
                productType: 'Brahmacari',
                accountNumber: tx.noBrahmacari,
                accountName: tx.brahmacari.nasabah.nama,
                transType: tx.tipeTrans,
                amount: Number(tx.nominal),
                timestamp: tx.createdAt,
                description: tx.keterangan
            });
        });
        const balimesariTxs = await this.prisma.transBalimesari.findMany({
            where: {
                createdBy: username,
                createdAt: { gte: todayStart, lte: todayEnd }
            },
            include: {
                balimesari: {
                    include: {
                        nasabah: {
                            select: { nama: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        balimesariTxs.forEach(tx => {
            transactions.push({
                id: `balimesari-${tx.id}`,
                productType: 'Balimesari',
                accountNumber: tx.noBalimesari,
                accountName: tx.balimesari.nasabah.nama,
                transType: tx.tipeTrans,
                amount: Number(tx.nominal),
                timestamp: tx.createdAt,
                description: tx.keterangan
            });
        });
        const wanaprastaTxs = await this.prisma.transWanaprasta.findMany({
            where: {
                createdBy: username,
                createdAt: { gte: todayStart, lte: todayEnd }
            },
            include: {
                wanaprasta: {
                    include: {
                        nasabah: {
                            select: { nama: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        wanaprastaTxs.forEach(tx => {
            transactions.push({
                id: `wanaprasta-${tx.id}`,
                productType: 'Wanaprasta',
                accountNumber: tx.noWanaprasta,
                accountName: tx.wanaprasta.nasabah.nama,
                transType: tx.tipeTrans,
                amount: Number(tx.nominal),
                timestamp: tx.createdAt,
                description: tx.keterangan
            });
        });
        transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return transactions;
    }
    async getActiveShift(userId) {
        return this.prisma.collectorShift.findFirst({
            where: {
                userId: userId,
                status: 'ACTIVE'
            },
            include: { user: { select: { fullName: true } } }
        });
    }
    async startShift(userId, dto) {
        const existing = await this.getActiveShift(userId);
        if (existing) {
            throw new common_1.BadRequestException('User already has an active shift');
        }
        const startingCash = this.calculateDenominationTotal(dto.denominations);
        return this.prisma.collectorShift.create({
            data: {
                userId: userId,
                status: 'ACTIVE',
                startingCash: startingCash,
                startDenom100k: dto.denominations.denom100k,
                startDenom50k: dto.denominations.denom50k,
                startDenom20k: dto.denominations.denom20k,
                startDenom10k: dto.denominations.denom10k,
                startDenom5k: dto.denominations.denom5k,
                startDenom2k: dto.denominations.denom2k,
                startDenom1k: dto.denominations.denom1k,
                startDenom500: dto.denominations.denom500,
                startDenom200: dto.denominations.denom200,
                startDenom100: dto.denominations.denom100,
            }
        });
    }
    async endShift(userId, dto) {
        const shift = await this.getActiveShift(userId);
        if (!shift) {
            throw new common_1.NotFoundException('No active shift found');
        }
        const endingCash = this.calculateDenominationTotal(dto.denominations);
        const expectedCash = Number(shift.startingCash) + Number(shift.totalDeposits) - Number(shift.totalWithdrawals);
        if (endingCash !== expectedCash) {
            throw new common_1.BadRequestException(`Cash mismatch! Expected: ${expectedCash}, Actual: ${endingCash}. Difference: ${endingCash - expectedCash}`);
        }
        return this.prisma.$transaction(async (tx) => {
            const netChange = Number(shift.totalDeposits) - Number(shift.totalWithdrawals);
            let journalId = null;
            if (netChange !== 0) {
                const journal = await this.accountingService.createManualJournal({
                    date: new Date(),
                    description: `Reconcile Shift: ${shift.id} - ${shift.user?.fullName || 'Collector'}`,
                    userId: userId,
                    details: [
                        {
                            accountCode: '1.01.01',
                            debit: netChange > 0 ? netChange : 0,
                            credit: netChange < 0 ? Math.abs(netChange) : 0
                        },
                        {
                            accountCode: '1.01.05',
                            debit: netChange < 0 ? Math.abs(netChange) : 0,
                            credit: netChange > 0 ? netChange : 0
                        }
                    ]
                });
                journalId = journal.id;
            }
            return tx.collectorShift.update({
                where: { id: shift.id },
                data: {
                    status: 'CLOSED',
                    endTime: new Date(),
                    endingCash: endingCash,
                    closingJournalId: journalId,
                    endDenom100k: dto.denominations.denom100k,
                    endDenom50k: dto.denominations.denom50k,
                    endDenom20k: dto.denominations.denom20k,
                    endDenom10k: dto.denominations.denom10k,
                    endDenom5k: dto.denominations.denom5k,
                    endDenom2k: dto.denominations.denom2k,
                    endDenom1k: dto.denominations.denom1k,
                    endDenom500: dto.denominations.denom500,
                    endDenom200: dto.denominations.denom200,
                    endDenom100: dto.denominations.denom100,
                }
            });
        });
    }
    async updateShiftStats(userId, isDeposit, amount) {
        const shift = await this.getActiveShift(userId);
        if (!shift)
            return;
        await this.prisma.collectorShift.update({
            where: { id: shift.id },
            data: {
                totalDeposits: { increment: isDeposit ? amount : 0 },
                totalWithdrawals: { increment: !isDeposit ? amount : 0 },
                transactionCount: { increment: 1 }
            }
        });
    }
    calculateDenominationTotal(d) {
        return ((d.denom100k || 0) * 100000 +
            (d.denom50k || 0) * 50000 +
            (d.denom20k || 0) * 20000 +
            (d.denom10k || 0) * 10000 +
            (d.denom5k || 0) * 5000 +
            (d.denom2k || 0) * 2000 +
            (d.denom1k || 0) * 1000 +
            (d.denom500 || 0) * 500 +
            (d.denom200 || 0) * 200 +
            (d.denom100 || 0) * 100);
    }
};
exports.CollectorService = CollectorService;
exports.CollectorService = CollectorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        accounting_service_1.AccountingService])
], CollectorService);
//# sourceMappingURL=collector.service.js.map