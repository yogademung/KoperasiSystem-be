import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class SimpananInterestService {
    private readonly logger = new Logger(SimpananInterestService.name);

    constructor(private prisma: PrismaService) { }

    // Run at 00:00 on 1st day of every month
    @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
    async handleMonthlyInterest() {
        this.logger.log('Starting monthly interest calculation...');

        await this.processTabrelaInterest();
        await this.processBrahmacariInterest();
        await this.processBalimesariInterest();
        await this.processWanaprastaInterest();
        // Deposito logic to be added - usually triggered by maturity date not just monthly, 
        // but if it has monthly payout, we add it here.

        this.logger.log('Monthly interest calculation completed.');
    }

    // 1. Tabrela (Umum) - 2% p.a
    async processTabrelaInterest() {
        const RATE = 0.02;
        const ADMIN_FEE = 5000;

        // Process in batches (simplified for MVP)
        const accounts = await this.prisma.nasabahTab.findMany({
            where: { status: 'A', saldo: { gt: 0 } }
        });

        for (const acc of accounts) {
            // Use defined rate in DB or fallback to default
            const interestRate = Number(acc.interestRate) > 0 ? Number(acc.interestRate) / 100 : RATE;

            // Calculate Interest
            // Formula: Saldo * Rate / 12
            const interest = (Number(acc.saldo) * interestRate) / 12;

            // Tax
            let tax = 0;
            if (interest > 240000) {
                tax = interest * 0.20;
            }

            const netInterest = interest - tax;

            // Skip if interest is negligible
            if (netInterest <= 0) continue;

            await this.prisma.$transaction(async (tx) => {
                // Credit Interest
                await this.createTransaction(tx, 'm_nasabah_tab', 't_trans_tab', 'noTab', acc.noTab, 'BUNGA', interest, 'Bunga Bulanan');

                // Debit Tax
                if (tax > 0) {
                    await this.createTransaction(tx, 'm_nasabah_tab', 't_trans_tab', 'noTab', acc.noTab, 'PAJAK', -tax, 'Pajak Bunga');
                }

                // Debit Admin
                if (ADMIN_FEE > 0 && Number(acc.saldo) > ADMIN_FEE) {
                    await this.createTransaction(tx, 'm_nasabah_tab', 't_trans_tab', 'noTab', acc.noTab, 'ADM', -ADMIN_FEE, 'Biaya Admin');
                }
            });
        }
    }

    // 2. Brahmacari (Student) - 3% p.a, No Admin
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
            if (interest > 240000) tax = interest * 0.20;

            await this.prisma.$transaction(async (tx) => {
                await this.createTransaction(tx, 'm_nasabah_brahmacari', 't_trans_brahmacari', 'noBrahmacari', acc.noBrahmacari, 'BUNGA', interest, 'Bunga Bulanan');
                if (tax > 0) {
                    await this.createTransaction(tx, 'm_nasabah_brahmacari', 't_trans_brahmacari', 'noBrahmacari', acc.noBrahmacari, 'PAJAK', -tax, 'Pajak Bunga');
                }
            });
        }
    }

    // 3. Bali Mesari - 4% p.a, Admin 10k
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
            if (interest > 240000) tax = interest * 0.20;

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

    // 4. Wanaprasta - 5% p.a, Admin 5k
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
            if (interest > 240000) tax = interest * 0.20;

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

    // Generic helper to create trans & update balance. Dynamic table names.
    private async createTransaction(tx: any, tableModel: string, transModel: string, idField: string, idValue: string, type: string, amount: number, desc: string) {
        // 1. Get current balance
        // Note: Prisma dynamic access tx[model]
        const account = await tx[tableModel].findUnique({ where: { [idField]: idValue } });
        const newBalance = Number(account.saldo) + amount;

        // 2. Create Transaction
        await tx[transModel].create({
            data: {
                [idField]: idValue,
                tipeTrans: type,
                nominal: Math.abs(amount), // Transaction amount usually positive, type determines sign? 
                // BUT check schema: 'nominal' usually positive. 'saldoAkhir' reflects change.
                // For 'PAJAK' or 'ADM', balance decreases.
                // We should store nominal as positive, but logic implies deduction.
                // Wait, typical accounting: Debit/Credit. 
                // Schema has 'nominal' and 'tipeTrans'. 
                // Let's assume nominal is absolute.
                saldoAkhir: newBalance,
                keterangan: desc,
                // createdBy: 'SYSTEM', // If field exists
            }
        });

        // 3. Update Balance
        await tx[tableModel].update({
            where: { [idField]: idValue },
            data: { saldo: newBalance }
        });
    }
}
