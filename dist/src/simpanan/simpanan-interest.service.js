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
var SimpananInterestService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpananInterestService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../database/prisma.service");
let SimpananInterestService = SimpananInterestService_1 = class SimpananInterestService {
    prisma;
    logger = new common_1.Logger(SimpananInterestService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async handleMonthlyInterest() {
        this.logger.log('Starting monthly interest calculation...');
        await this.processTabrelaInterest();
        await this.processBrahmacariInterest();
        await this.processBalimesariInterest();
        await this.processWanaprastaInterest();
        this.logger.log('Monthly interest calculation completed.');
    }
    async processTabrelaInterest() {
        const RATE = 0.02;
        const ADMIN_FEE = 5000;
        const accounts = await this.prisma.nasabahTab.findMany({
            where: { status: 'A', saldo: { gt: 0 } }
        });
        for (const acc of accounts) {
            const interestRate = Number(acc.interestRate) > 0 ? Number(acc.interestRate) / 100 : RATE;
            const interest = (Number(acc.saldo) * interestRate) / 12;
            let tax = 0;
            if (interest > 240000) {
                tax = interest * 0.20;
            }
            const netInterest = interest - tax;
            if (netInterest <= 0)
                continue;
            await this.prisma.$transaction(async (tx) => {
                await this.createTransaction(tx, 'm_nasabah_tab', 't_trans_tab', 'noTab', acc.noTab, 'BUNGA', interest, 'Bunga Bulanan');
                if (tax > 0) {
                    await this.createTransaction(tx, 'm_nasabah_tab', 't_trans_tab', 'noTab', acc.noTab, 'PAJAK', -tax, 'Pajak Bunga');
                }
                if (ADMIN_FEE > 0 && Number(acc.saldo) > ADMIN_FEE) {
                    await this.createTransaction(tx, 'm_nasabah_tab', 't_trans_tab', 'noTab', acc.noTab, 'ADM', -ADMIN_FEE, 'Biaya Admin');
                }
            });
        }
    }
    async processBrahmacariInterest() {
        const RATE = 0.03;
        const ADMIN_FEE = 0;
        const accounts = await this.prisma.nasabahBrahmacari.findMany({
            where: { status: 'A', saldo: { gt: 0 } }
        });
        for (const acc of accounts) {
            const interestRate = Number(acc.interestRate) > 0 ? Number(acc.interestRate) / 100 : RATE;
            const interest = (Number(acc.saldo) * interestRate) / 12;
            let tax = 0;
            if (interest > 240000)
                tax = interest * 0.20;
            await this.prisma.$transaction(async (tx) => {
                await this.createTransaction(tx, 'm_nasabah_brahmacari', 't_trans_brahmacari', 'noBrahmacari', acc.noBrahmacari, 'BUNGA', interest, 'Bunga Bulanan');
                if (tax > 0) {
                    await this.createTransaction(tx, 'm_nasabah_brahmacari', 't_trans_brahmacari', 'noBrahmacari', acc.noBrahmacari, 'PAJAK', -tax, 'Pajak Bunga');
                }
            });
        }
    }
    async processBalimesariInterest() {
        const RATE = 0.04;
        const ADMIN_FEE = 10000;
        const accounts = await this.prisma.nasabahBalimesari.findMany({
            where: { status: 'A', saldo: { gt: 0 } }
        });
        for (const acc of accounts) {
            const interestRate = Number(acc.interestRate) > 0 ? Number(acc.interestRate) / 100 : RATE;
            const interest = (Number(acc.saldo) * interestRate) / 12;
            let tax = 0;
            if (interest > 240000)
                tax = interest * 0.20;
            await this.prisma.$transaction(async (tx) => {
                await this.createTransaction(tx, 'm_nasabah_balimesari', 't_trans_balimesari', 'noBalimesari', acc.noBalimesari, 'BUNGA', interest, 'Bunga Bulanan');
                if (tax > 0) {
                    await this.createTransaction(tx, 'm_nasabah_balimesari', 't_trans_balimesari', 'noBalimesari', acc.noBalimesari, 'PAJAK', -tax, 'Pajak Bunga');
                }
                if (ADMIN_FEE > 0 && Number(acc.saldo) > ADMIN_FEE) {
                    await this.createTransaction(tx, 'm_nasabah_balimesari', 't_trans_balimesari', 'noBalimesari', acc.noBalimesari, 'ADM', -ADMIN_FEE, 'Biaya Admin');
                }
            });
        }
    }
    async processWanaprastaInterest() {
        const RATE = 0.05;
        const ADMIN_FEE = 5000;
        const accounts = await this.prisma.nasabahWanaprasta.findMany({
            where: { status: 'A', saldo: { gt: 0 } }
        });
        for (const acc of accounts) {
            const interestRate = Number(acc.interestRate) > 0 ? Number(acc.interestRate) / 100 : RATE;
            const interest = (Number(acc.saldo) * interestRate) / 12;
            let tax = 0;
            if (interest > 240000)
                tax = interest * 0.20;
            await this.prisma.$transaction(async (tx) => {
                await this.createTransaction(tx, 'm_nasabah_wanaprasta', 't_trans_wanaprasta', 'noWanaprasta', acc.noWanaprasta, 'BUNGA', interest, 'Bunga Bulanan');
                if (tax > 0) {
                    await this.createTransaction(tx, 'm_nasabah_wanaprasta', 't_trans_wanaprasta', 'noWanaprasta', acc.noWanaprasta, 'PAJAK', -tax, 'Pajak Bunga');
                }
                if (ADMIN_FEE > 0 && Number(acc.saldo) > ADMIN_FEE) {
                    await this.createTransaction(tx, 'm_nasabah_wanaprasta', 't_trans_wanaprasta', 'noWanaprasta', acc.noWanaprasta, 'ADM', -ADMIN_FEE, 'Biaya Admin');
                }
            });
        }
    }
    async createTransaction(tx, tableModel, transModel, idField, idValue, type, amount, desc) {
        const account = await tx[tableModel].findUnique({ where: { [idField]: idValue } });
        const newBalance = Number(account.saldo) + amount;
        await tx[transModel].create({
            data: {
                [idField]: idValue,
                tipeTrans: type,
                nominal: Math.abs(amount),
                saldoAkhir: newBalance,
                keterangan: desc,
            }
        });
        await tx[tableModel].update({
            where: { [idField]: idValue },
            data: { saldo: newBalance }
        });
    }
};
exports.SimpananInterestService = SimpananInterestService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SimpananInterestService.prototype, "handleMonthlyInterest", null);
exports.SimpananInterestService = SimpananInterestService = SimpananInterestService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SimpananInterestService);
//# sourceMappingURL=simpanan-interest.service.js.map