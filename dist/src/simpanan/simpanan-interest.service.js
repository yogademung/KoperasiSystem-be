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
    async handleDailyScheduler() {
        const today = new Date();
        this.logger.log(`Starting daily interest check for ${today.toISOString().split('T')[0]}...`);
        await this.processDepositoInterest();
        if (today.getDate() === 1) {
            this.logger.log('Date is 1st of month. Processing Monthly Savings Interest...');
            await this.processTabrelaInterest();
            await this.processBrahmacariInterest();
            await this.processBalimesariInterest();
            await this.processWanaprastaInterest();
        }
        this.logger.log('Daily interest check completed.');
    }
    async forceRunAllInterest() {
        this.logger.log('FORCE RUNNING ALL INTEREST CHECKS...');
        await this.processDepositoInterest();
        this.logger.log('Force processing Monthly Savings Interest...');
        await this.processTabrelaInterest();
        await this.processBrahmacariInterest();
        await this.processBalimesariInterest();
        await this.processWanaprastaInterest();
        this.logger.log('Force Run completed.');
    }
    async processDepositoInterest(targetNoJangka) {
        const today = new Date();
        const currentDay = today.getDate();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const isEndOfMonth = tomorrow.getDate() === 1;
        const whereClause = { status: 'A' };
        if (targetNoJangka) {
            whereClause.noJangka = targetNoJangka;
        }
        const depositos = await this.prisma.nasabahJangka.findMany({
            where: whereClause,
            include: { nasabah: true }
        });
        this.logger.log(`Found ${depositos.length} active depositos to check.`);
        for (const dep of depositos) {
            if (!targetNoJangka) {
                const openDay = dep.tglBuka.getDate();
                let isDue = false;
                if (openDay === currentDay) {
                    isDue = true;
                }
                else if (isEndOfMonth && openDay > currentDay) {
                    isDue = true;
                }
                if (!isDue) {
                    continue;
                }
            }
            this.logger.log(`Processing Interest for ${dep.noJangka} (Due Today)`);
            const interest = (Number(dep.nominal) * (Number(dep.bunga) / 100)) / 12;
            let tax = 0;
            if (interest > 240000)
                tax = interest * 0.20;
            const netInterest = interest - tax;
            if (netInterest <= 0)
                continue;
            await this.prisma.$transaction(async (tx) => {
                if (dep.payoutMode === 'ROLLOVER') {
                    const newNominal = Number(dep.nominal) + netInterest;
                    await tx.transJangka.create({
                        data: {
                            noJangka: dep.noJangka,
                            tipeTrans: 'BUNGA',
                            nominal: netInterest,
                            keterangan: 'Bunga Bulanan (Rollover)',
                            createdBy: 'SYSTEM'
                        }
                    });
                    await tx.nasabahJangka.update({
                        where: { noJangka: dep.noJangka },
                        data: { nominal: newNominal }
                    });
                }
                else if (dep.payoutMode === 'TRANSFER' && dep.targetAccountId) {
                    await tx.transJangka.create({
                        data: {
                            noJangka: dep.noJangka,
                            tipeTrans: 'BUNGA_OUT',
                            nominal: netInterest,
                            keterangan: `Transfer Bunga ke ${dep.targetAccountId}`,
                            createdBy: 'SYSTEM'
                        }
                    });
                    await this.createTransaction(tx, 'nasabahTab', 'transTab', 'noTab', dep.targetAccountId, 'BUNGA_DEP', netInterest, `Bunga Deposito ${dep.noJangka}`);
                }
                else {
                    await tx.transJangka.create({
                        data: {
                            noJangka: dep.noJangka,
                            tipeTrans: 'BUNGA',
                            nominal: netInterest,
                            keterangan: 'Bunga Bulanan (Akumulasi)',
                            createdBy: 'SYSTEM'
                        }
                    });
                }
            });
        }
    }
    async simulateProcessing(noJangka) {
        const dep = await this.prisma.nasabahJangka.findUnique({
            where: { noJangka },
            include: { nasabah: true }
        });
        if (!dep)
            throw new Error('Deposito not found');
        const interest = (Number(dep.nominal) * (Number(dep.bunga) / 100)) / 12;
        let tax = 0;
        if (interest > 240000)
            tax = interest * 0.20;
        const netInterest = interest - tax;
        return {
            noJangka: dep.noJangka,
            nama: dep.nasabah.nama,
            nominal: dep.nominal,
            rate: dep.bunga,
            grossInterest: interest,
            tax,
            netInterest,
            payoutMode: dep.payoutMode,
            targetAccountId: dep.targetAccountId
        };
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
                await this.createTransaction(tx, 'nasabahTab', 'transTab', 'noTab', acc.noTab, 'BUNGA', interest, 'Bunga Bulanan');
                if (tax > 0) {
                    await this.createTransaction(tx, 'nasabahTab', 'transTab', 'noTab', acc.noTab, 'PAJAK', -tax, 'Pajak Bunga');
                }
                if (ADMIN_FEE > 0 && Number(acc.saldo) > ADMIN_FEE) {
                    await this.createTransaction(tx, 'nasabahTab', 'transTab', 'noTab', acc.noTab, 'ADM', -ADMIN_FEE, 'Biaya Admin');
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
                await this.createTransaction(tx, 'nasabahBrahmacari', 'transBrahmacari', 'noBrahmacari', acc.noBrahmacari, 'BUNGA', interest, 'Bunga Bulanan');
                if (tax > 0) {
                    await this.createTransaction(tx, 'nasabahBrahmacari', 'transBrahmacari', 'noBrahmacari', acc.noBrahmacari, 'PAJAK', -tax, 'Pajak Bunga');
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
                await this.createTransaction(tx, 'nasabahBalimesari', 'transBalimesari', 'noBalimesari', acc.noBalimesari, 'BUNGA', interest, 'Bunga Bulanan');
                if (tax > 0) {
                    await this.createTransaction(tx, 'nasabahBalimesari', 'transBalimesari', 'noBalimesari', acc.noBalimesari, 'PAJAK', -tax, 'Pajak Bunga');
                }
                if (ADMIN_FEE > 0 && Number(acc.saldo) > ADMIN_FEE) {
                    await this.createTransaction(tx, 'nasabahBalimesari', 'transBalimesari', 'noBalimesari', acc.noBalimesari, 'ADM', -ADMIN_FEE, 'Biaya Admin');
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
                await this.createTransaction(tx, 'nasabahWanaprasta', 'transWanaprasta', 'noWanaprasta', acc.noWanaprasta, 'BUNGA', interest, 'Bunga Bulanan');
                if (tax > 0) {
                    await this.createTransaction(tx, 'nasabahWanaprasta', 'transWanaprasta', 'noWanaprasta', acc.noWanaprasta, 'PAJAK', -tax, 'Pajak Bunga');
                }
                if (ADMIN_FEE > 0 && Number(acc.saldo) > ADMIN_FEE) {
                    await this.createTransaction(tx, 'nasabahWanaprasta', 'transWanaprasta', 'noWanaprasta', acc.noWanaprasta, 'ADM', -ADMIN_FEE, 'Biaya Admin');
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
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SimpananInterestService.prototype, "handleDailyScheduler", null);
exports.SimpananInterestService = SimpananInterestService = SimpananInterestService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SimpananInterestService);
//# sourceMappingURL=simpanan-interest.service.js.map