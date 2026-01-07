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
const prisma_service_1 = require("../database/prisma.service");
const accounting_service_1 = require("../accounting/accounting.service");
const date_fns_1 = require("date-fns");
let CollectorService = class CollectorService {
    prisma;
    accountingService;
    constructor(prisma, accountingService) {
        this.prisma = prisma;
        this.accountingService = accountingService;
    }
    async getDailyStats(userId, shiftStartTime) {
        const startTime = shiftStartTime || (0, date_fns_1.startOfDay)(new Date());
        const endTime = (0, date_fns_1.endOfDay)(new Date());
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return { todayTransactions: 0, todayDeposits: 0, todayWithdrawals: 0 };
        }
        const username = user.username;
        const anggotaStats = await this.getStatsForModel(this.prisma.anggotaTransaction, {
            userId: userId,
            transDate: { gte: startTime, lte: endTime }
        }, 'AnggotaTransaction');
        const savingsTables = [
            { model: this.prisma.transTab, name: 'TransTab' },
            { model: this.prisma.transBrahmacari, name: 'TransBrahmacari' },
            { model: this.prisma.transBalimesari, name: 'TransBalimesari' },
            { model: this.prisma.transWanaprasta, name: 'TransWanaprasta' }
        ];
        let totalStats = { ...anggotaStats };
        for (const table of savingsTables) {
            const stats = await this.getStatsForModel(table.model, {
                createdBy: username,
                createdAt: { gte: startTime, lte: endTime }
            }, table.name, 'nominal', 'tipeTrans');
            totalStats.count += stats.count;
            totalStats.deposits += stats.deposits;
            totalStats.withdrawals += stats.withdrawals;
        }
        return {
            todayTransactions: totalStats.count,
            todayDeposits: totalStats.deposits,
            todayWithdrawals: totalStats.withdrawals
        };
    }
    async getStatsForModel(model, whereClause, modelName, amountField = 'amount', typeField = 'transType') {
        if (!model)
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
                const type = (t[typeField] || '').toUpperCase();
                if (type.includes('TARIK') || type.includes('PENARIKAN') || type.includes('WITHDRAW') || (modelName === 'AnggotaTransaction' && amt < 0)) {
                    withdrawals += Math.abs(amt);
                }
                else {
                    deposits += Math.abs(amt);
                }
            });
            return { count: txs.length, deposits, withdrawals };
        }
        catch (error) {
            console.error(`Error fetching stats for ${modelName}: `, error);
            return { count: 0, deposits: 0, withdrawals: 0 };
        }
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
        const shift = await this.prisma.collectorShift.create({
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
        if (startingCash > 0) {
            try {
                const user = await this.prisma.user.findUnique({ where: { id: userId } });
                const userName = user ? user.fullName : 'Collector';
                await this.accountingService.createManualJournal({
                    date: new Date(),
                    userId: userId,
                    description: `Modal Awal Shift Kolektor - ${userName} (Shift #${shift.id})`,
                    postingType: 'AUTO',
                    details: [
                        { accountCode: '1.01.05', debit: startingCash, credit: 0, description: 'Kas Transit Kolektor (Modal)' },
                        { accountCode: '1.01.01', debit: 0, credit: startingCash, description: 'Kas Kantor (Keluar)' }
                    ]
                });
            }
            catch (error) {
                console.error('Failed to post start shift journal:', error);
            }
        }
        return shift;
    }
    async endShift(userId, dto) {
        const shift = await this.getActiveShift(userId);
        if (!shift) {
            throw new common_1.NotFoundException('No active shift found');
        }
        const endingCash = this.calculateDenominationTotal(dto.denominations);
        const stats = await this.getDailyStats(userId, shift.startTime);
        const closedShift = await this.prisma.collectorShift.update({
            where: { id: shift.id },
            data: {
                status: 'CLOSED',
                endTime: new Date(),
                endingCash: endingCash,
                totalDeposits: stats.todayDeposits,
                totalWithdrawals: stats.todayWithdrawals,
                transactionCount: stats.todayTransactions,
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
        if (endingCash > 0) {
            try {
                const user = await this.prisma.user.findUnique({ where: { id: userId } });
                const userName = user ? user.fullName : 'Collector';
                await this.accountingService.createManualJournal({
                    date: new Date(),
                    userId: userId,
                    description: `Setor Kas Akhir Shift - ${userName} (Shift #${shift.id})`,
                    postingType: 'AUTO',
                    details: [
                        { accountCode: '1.01.01', debit: endingCash, credit: 0, description: 'Kas Kantor (Masuk)' },
                        { accountCode: '1.01.05', debit: 0, credit: endingCash, description: 'Kas Transit Kolektor (Keluar)' }
                    ]
                });
            }
            catch (error) {
                console.error('Failed to post end shift journal:', error);
            }
        }
        return closedShift;
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
    async getFlashSummary() {
        const activeShifts = await this.prisma.collectorShift.findMany({
            where: {
                status: 'ACTIVE'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true
                    }
                }
            }
        });
        const totalCashInHand = activeShifts.reduce((sum, shift) => {
            return sum + Number(shift.startingCash || 0);
        }, 0);
        let totalDeposits = 0;
        let totalWithdrawals = 0;
        let totalTransactions = 0;
        for (const shift of activeShifts) {
            const stats = await this.getDailyStats(shift.userId, shift.startTime);
            totalDeposits += stats.todayDeposits;
            totalWithdrawals += stats.todayWithdrawals;
            totalTransactions += stats.todayTransactions;
        }
        return {
            activeCollectors: activeShifts.length,
            totalCashInHand,
            totalDeposits,
            totalWithdrawals,
            totalTransactions,
            collectors: activeShifts.map(shift => ({
                name: shift.user.fullName,
                cashInHand: Number(shift.startingCash || 0),
                shiftStartTime: shift.startTime
            }))
        };
    }
};
exports.CollectorService = CollectorService;
exports.CollectorService = CollectorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        accounting_service_1.AccountingService])
], CollectorService);
//# sourceMappingURL=collector.service.js.map