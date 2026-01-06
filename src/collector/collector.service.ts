import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { StartShiftDto, EndShiftDto, DenominationDto } from './dto/collector-shift.dto';
import { AccountingService } from '../accounting/accounting.service';
import { PrismaService } from '../database/prisma.service';
import { startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class CollectorService {
    constructor(
        private prisma: PrismaService,
        private accountingService: AccountingService
    ) { }

    async getDailyStats(userId: number) {
        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());

        // Get User details to retrieve username (for createdBy fields)
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            console.log(`User not found for ID: ${userId}`);
            return { todayTransactions: 0, todayDeposits: 0, todayWithdrawals: 0 };
        }

        const username = user.username;

        // 1. AnggotaTransaction (Uses userId, amount, transType)
        const anggotaStats = await this.getStatsForModel(
            this.prisma.anggotaTransaction,
            {
                userId: userId,
                transDate: { gte: todayStart, lte: todayEnd }
            },
            'AnggotaTransaction',
            'amount',
            'transType'
        );

        // 2. TransTab (Uses createdBy, nominal, tipeTrans)
        const tabStats = await this.getStatsForModel(
            this.prisma.transTab,
            {
                createdBy: username,
                createdAt: { gte: todayStart, lte: todayEnd }
            },
            'TransTab',
            'nominal',
            'tipeTrans'
        );

        // 3. TransBrahmacari (Uses createdBy, nominal, tipeTrans)
        const brahmacariStats = await this.getStatsForModel(
            this.prisma.transBrahmacari,
            {
                createdBy: username,
                createdAt: { gte: todayStart, lte: todayEnd }
            },
            'TransBrahmacari',
            'nominal',
            'tipeTrans'
        );

        // 4. TransBalimesari (Uses createdBy, nominal, tipeTrans)
        const balimesariStats = await this.getStatsForModel(
            this.prisma.transBalimesari,
            {
                createdBy: username,
                createdAt: { gte: todayStart, lte: todayEnd }
            },
            'TransBalimesari',
            'nominal',
            'tipeTrans'
        );

        // 5. TransWanaprasta (Uses createdBy, nominal, tipeTrans)
        const wanaprastaStats = await this.getStatsForModel(
            this.prisma.transWanaprasta,
            {
                createdBy: username,
                createdAt: { gte: todayStart, lte: todayEnd }
            },
            'TransWanaprasta',
            'nominal',
            'tipeTrans'
        );

        // Aggregate
        const allStats = [anggotaStats, tabStats, brahmacariStats, balimesariStats, wanaprastaStats];

        return allStats.reduce((acc, curr) => ({
            todayTransactions: acc.todayTransactions + curr.count,
            todayDeposits: acc.todayDeposits + curr.deposits,
            todayWithdrawals: acc.todayWithdrawals + curr.withdrawals
        }), { todayTransactions: 0, todayDeposits: 0, todayWithdrawals: 0 });
    }

    private async getStatsForModel(
        model: any,
        whereClause: any,
        modelName: string,
        amountField: string = 'amount',
        typeField: string = 'transType'
    ) {
        if (!model) return { count: 0, deposits: 0, withdrawals: 0 };

        if (typeof model.findMany !== 'function') return { count: 0, deposits: 0, withdrawals: 0 };

        try {
            // Dynamically construct select object
            const selectObj: any = {};
            selectObj[amountField] = true;
            selectObj[typeField] = true;

            const txs = await model.findMany({
                where: whereClause,
                select: selectObj
            });

            let deposits = 0;
            let withdrawals = 0;

            txs.forEach((t: any) => {
                const amt = Number(t[amountField] || 0);

                // Logic: 
                // Negative amount = Withdrawal
                // Positive amount = Deposit
                // Exception: AnggotaService penarikan creates negative amount.

                if (amt < 0) {
                    withdrawals += Math.abs(amt);
                } else {
                    deposits += amt;
                }
            });

            return { count: txs.length, deposits, withdrawals };
        } catch (error) {
            console.error(`Error fetching stats for ${modelName}:`, error);
            return { count: 0, deposits: 0, withdrawals: 0 };
        }
    }

    async getDailyTransactions(userId: number) {
        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());

        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return [];
        }

        const username = user.username;
        const transactions: Array<{
            id: string;
            productType: string;
            accountNumber: string;
            accountName: string;
            transType: string;
            amount: number;
            timestamp: Date;
            description: string | null;
        }> = [];

        // 1. Fetch Anggota Transactions
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

        // 2. Fetch TransTab
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

        // 3. Fetch TransBrahmacari
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

        // 4. Fetch TransBalimesari
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

        // 5. Fetch TransWanaprasta
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

        // Sort all transactions by timestamp (most recent first)
        transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return transactions;
    }

    async getActiveShift(userId: number) {
        return this.prisma.collectorShift.findFirst({
            where: {
                userId: userId,
                status: 'ACTIVE'
            },
            include: { user: { select: { fullName: true } } }
        });
    }

    async startShift(userId: number, dto: StartShiftDto) {
        // 1. Check if already active
        const existing = await this.getActiveShift(userId);
        if (existing) {
            throw new BadRequestException('User already has an active shift');
        }

        // 2. Calculate Total Starting Cash
        const startingCash = this.calculateDenominationTotal(dto.denominations);

        // 3. Create Shift
        return this.prisma.collectorShift.create({
            data: {
                userId: userId,
                status: 'ACTIVE',
                startingCash: startingCash,

                // Denominations
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

    async endShift(userId: number, dto: EndShiftDto) {
        const shift = await this.getActiveShift(userId);
        if (!shift) {
            throw new NotFoundException('No active shift found');
        }

        const endingCash = this.calculateDenominationTotal(dto.denominations);

        // Calculate Expected Cash
        const expectedCash = Number(shift.startingCash) + Number(shift.totalDeposits) - Number(shift.totalWithdrawals);

        if (endingCash !== expectedCash) {
            throw new BadRequestException(`Cash mismatch! Expected: ${expectedCash}, Actual: ${endingCash}. Difference: ${endingCash - expectedCash}`);
        }

        // Close Shift Transactionally
        return this.prisma.$transaction(async (tx) => {
            const netChange = Number(shift.totalDeposits) - Number(shift.totalWithdrawals);

            let journalId: number | null = null;

            if (netChange !== 0) {
                const journal = await this.accountingService.createManualJournal({
                    date: new Date(),
                    description: `Reconcile Shift: ${shift.id} - ${shift.user?.fullName || 'Collector'}`,
                    userId: userId,
                    details: [
                        {
                            accountCode: '1.01.01', // Kas Kantor
                            debit: netChange > 0 ? netChange : 0,
                            credit: netChange < 0 ? Math.abs(netChange) : 0
                        },
                        {
                            accountCode: '1.01.05', // Kas Transit Kolektor
                            debit: netChange < 0 ? Math.abs(netChange) : 0,
                            credit: netChange > 0 ? netChange : 0
                        }
                    ]
                });
                journalId = journal.id;
            }

            // 2. Update Shift Record
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

    async updateShiftStats(userId: number, isDeposit: boolean, amount: number) {
        const shift = await this.getActiveShift(userId);
        if (!shift) return;

        await this.prisma.collectorShift.update({
            where: { id: shift.id },
            data: {
                totalDeposits: { increment: isDeposit ? amount : 0 },
                totalWithdrawals: { increment: !isDeposit ? amount : 0 },
                transactionCount: { increment: 1 }
            }
        });
    }

    private calculateDenominationTotal(d: DenominationDto): number {
        return (
            (d.denom100k || 0) * 100000 +
            (d.denom50k || 0) * 50000 +
            (d.denom20k || 0) * 20000 +
            (d.denom10k || 0) * 10000 +
            (d.denom5k || 0) * 5000 +
            (d.denom2k || 0) * 2000 +
            (d.denom1k || 0) * 1000 +
            (d.denom500 || 0) * 500 +
            (d.denom200 || 0) * 200 +
            (d.denom100 || 0) * 100
        );
    }
}
