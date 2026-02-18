import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  StartShiftDto,
  EndShiftDto,
  DenominationDto,
} from './dto/collector-shift.dto';
import { PrismaService } from '../database/prisma.service';
import { AccountingService } from '../accounting/accounting.service';
import { SystemDateService } from '../system/system-date.service';
import { startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class CollectorService {
  constructor(
    private prisma: PrismaService,
    private accountingService: AccountingService,
    private systemDateService: SystemDateService,
  ) { }

  async getDailyStats(userId: number, shiftStartTime?: Date) {
    // Use shift start time if provided, otherwise use start of today
    const startTime = shiftStartTime || startOfDay(new Date());
    const endTime = endOfDay(new Date());

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { todayTransactions: 0, todayDeposits: 0, todayWithdrawals: 0 };
    }

    const username = user.username;

    // 1. AnggotaTransaction (Uses userId)
    const anggotaStats = await this.getStatsForModel(
      this.prisma.anggotaTransaction,
      {
        userId: userId,
        transDate: { gte: startTime, lte: endTime },
      },
      'AnggotaTransaction',
    );

    // 2. Savings Products (Uses createdBy username)
    // 2. Savings Products (Uses createdBy username)
    const savingsTables = [
      { model: this.prisma.transTab, name: 'TransTab' },
      { model: this.prisma.transBrahmacari, name: 'TransBrahmacari' },
      { model: this.prisma.transBalimesari, name: 'TransBalimesari' },
      { model: this.prisma.transWanaprasta, name: 'TransWanaprasta' }, // typeField removed as it defaults to tipeTrans in getStatsForModel
    ];

    const totalStats = { ...anggotaStats };

    for (const table of savingsTables) {
      const stats = await this.getStatsForModel(
        table.model,
        {
          createdBy: username,
          createdAt: { gte: startTime, lte: endTime },
        },
        table.name,
        'nominal',
        (table as any).typeField || 'tipeTrans',
      );

      totalStats.count += stats.count;
      totalStats.deposits += stats.deposits;
      totalStats.withdrawals += stats.withdrawals;
    }

    // 3. TransKredit (Credit Payments) - Uses userId or username
    // Using createdAt to match shift window logic consistenly
    const kreditStats = await this.getStatsForModel(
      this.prisma.transKredit,
      {
        createdBy: { in: [username, String(userId)] },
        createdAt: { gte: startTime, lte: endTime },
      },
      'TransKredit',
      'nominal',
      'tipeTrans',
    );

    totalStats.count += kreditStats.count;
    totalStats.deposits += kreditStats.deposits;
    totalStats.withdrawals += kreditStats.withdrawals;

    return {
      todayTransactions: totalStats.count,
      todayDeposits: totalStats.deposits,
      todayWithdrawals: totalStats.withdrawals,
    };
  }

  private async getStatsForModel(
    model: any,
    whereClause: any,
    modelName: string,
    amountField: string = 'amount',
    typeField: string = 'transType',
  ) {
    if (!model) return { count: 0, deposits: 0, withdrawals: 0 };

    try {
      const selectObj: any = {};
      selectObj[amountField] = true;
      selectObj[typeField] = true;

      const txs = await model.findMany({
        where: whereClause,
        select: selectObj,
      });

      let deposits = 0;
      let withdrawals = 0;

      txs.forEach((t: any) => {
        const amt = Number(t[amountField] || 0);
        const type = (t[typeField] || '').toUpperCase();

        // Check for withdrawal keywords: TARIK, PENARIKAN, WITHDRAW
        if (
          type.includes('TARIK') ||
          type.includes('PENARIKAN') ||
          type.includes('WITHDRAW') ||
          (modelName === 'AnggotaTransaction' && amt < 0)
        ) {
          withdrawals += Math.abs(amt);
        } else {
          deposits += Math.abs(amt);
        }
      });

      return { count: txs.length, deposits, withdrawals };
    } catch (error) {
      console.error(`Error fetching stats for ${modelName}: `, error);
      return { count: 0, deposits: 0, withdrawals: 0 };
    }
  }

  async getActiveShift(userId: number) {
    return this.prisma.collectorShift.findFirst({
      where: {
        userId: userId,
        status: 'ACTIVE',
      },
      include: { user: { select: { fullName: true } } },
    });
  }

  async startShift(userId: number, dto: StartShiftDto) {
    const existing = await this.getActiveShift(userId);
    if (existing) {
      throw new BadRequestException('User already has an active shift');
    }

    const startingCash = this.calculateDenominationTotal(dto.denominations);

    // 1. Create Shift Record
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
      },
    });

    // 2. Post Journal (Float Transfer) if amount > 0
    if (startingCash > 0) {
      try {
        // Determine description
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
        });
        const userName = user ? user.fullName : 'Collector';

        await this.accountingService.createManualJournal({
          date: new Date(),
          userId: userId,
          description: `Modal Awal Shift Kolektor - ${userName} (Shift #${shift.id})`,
          postingType: 'AUTO',
          details: [
            {
              accountCode: '1.01.05',
              debit: startingCash,
              credit: 0,
              description: 'Kas Transit Kolektor (Modal)',
            },
            {
              accountCode: '1.01.01',
              debit: 0,
              credit: startingCash,
              description: 'Kas Kantor (Keluar)',
            },
          ],
        });
      } catch (error) {
        console.error('Failed to post start shift journal:', error);
        // Note: Journal failure is non-blocking for shift start, but should be noted.
      }
    }

    return shift;
  }

  async endShift(userId: number, dto: EndShiftDto) {
    const shift = await this.getActiveShift(userId);
    if (!shift) {
      throw new NotFoundException('No active shift found');
    }

    const endingCash = this.calculateDenominationTotal(dto.denominations);

    // Populate stats for THIS shift only (from shift start time)
    const stats = await this.getDailyStats(userId, shift.startTime);

    // Update and Close shift
    const closedShift = await this.prisma.collectorShift.update({
      where: { id: shift.id },
      data: {
        status: 'CLOSED',
        endTime: new Date(),
        endingCash: endingCash,

        // Record final stats snapshot
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
      },
    });

    // Post reverse journal (Return cash to main account) if amount > 0
    if (endingCash > 0) {
      try {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
        });
        const userName = user ? user.fullName : 'Collector';

        await this.accountingService.createManualJournal({
          date: new Date(),
          userId: userId,
          description: `Setor Kas Akhir Shift - ${userName} (Shift #${shift.id})`,
          postingType: 'AUTO',
          details: [
            {
              accountCode: '1.01.01',
              debit: endingCash,
              credit: 0,
              description: 'Kas Kantor (Masuk)',
            },
            {
              accountCode: '1.01.05',
              debit: 0,
              credit: endingCash,
              description: 'Kas Transit Kolektor (Keluar)',
            },
          ],
        });
      } catch (error) {
        console.error('Failed to post end shift journal:', error);
        // Note: Journal failure is logged but doesn't rollback shift closure
      }
    }

    // Auto-advance business date if all shifts are now closed
    try {
      const advanceResult = await this.systemDateService.advanceBusinessDate();
      if (advanceResult.success) {
        console.log(`📅 ${advanceResult.message}`);
      }
    } catch (error) {
      console.error('Failed to auto-advance business date:', error);
      // Non-blocking: Date advancement failure doesn't affect shift closure
    }

    return closedShift;
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

  async getMyTransactions(userId: number, shiftStartTime?: Date) {
    const startTime = shiftStartTime || startOfDay(new Date());
    const endTime = endOfDay(new Date());

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) return { transactions: [], totalKredit: 0 };
    const username = user.username;

    const allTx: Array<{
      date: Date;
      product: string;
      accountNumber: string;
      transType: string;
      amount: number;
      description: string;
    }> = [];

    // 1. AnggotaTransaction
    try {
      const rows = await this.prisma.anggotaTransaction.findMany({
        where: { userId, transDate: { gte: startTime, lte: endTime } },
        orderBy: { transDate: 'desc' },
      });
      for (const r of rows) {
        allTx.push({
          date: r.transDate,
          product: 'Simpanan Anggota',
          accountNumber: r.accountNumber,
          transType: r.transType,
          amount: Number(r.amount),
          description: r.description || '',
        });
      }
    } catch (e) { /* table may not exist */ }

    // 2. Savings tables (use createdBy = username)
    const savingsTables: Array<{
      model: any;
      name: string;
      accountField: string;
    }> = [
        { model: this.prisma.transTab, name: 'Tabungan', accountField: 'noTab' },
        { model: this.prisma.transBrahmacari, name: 'Brahmacari', accountField: 'noBrahmacari' },
        { model: this.prisma.transBalimesari, name: 'Balimesari', accountField: 'noBalimesari' },
        { model: this.prisma.transWanaprasta, name: 'Wanaprasta', accountField: 'noWanaprasta' },
      ];

    for (const tbl of savingsTables) {
      if (!tbl.model) continue;
      try {
        const rows = await tbl.model.findMany({
          where: { createdBy: username, createdAt: { gte: startTime, lte: endTime } },
          orderBy: { createdAt: 'desc' },
        });
        for (const r of rows) {
          allTx.push({
            date: r.createdAt,
            product: tbl.name,
            accountNumber: r[tbl.accountField] || '',
            transType: r.tipeTrans || '',
            amount: Number(r.nominal || 0),
            description: r.keterangan || '',
          });
        }
      } catch (e) { /* skip */ }
    }

    // 3. TransKredit (credit product)
    let totalKredit = 0;
    try {
      const kreditRows: any[] = await this.prisma.transKredit.findMany({
        where: {
          createdBy: { in: [username, String(userId)] },
          createdAt: { gte: startTime, lte: endTime },
        },
        include: {
          kredit: {
            select: { nomorKredit: true, nasabah: { select: { nama: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      for (const r of kreditRows) {
        const amt = Number(r.nominal || 0);
        totalKredit += amt;
        allTx.push({
          date: r.createdAt,
          product: 'Kredit',
          accountNumber: r.kredit?.nomorKredit || String(r.debiturKreditId),
          transType: r.tipeTrans || '',
          amount: amt,
          description: r.keterangan || (r.kredit?.nasabah?.nama || ''),
        });
      }
    } catch (e) { /* skip */ }

    // Sort all by date descending
    allTx.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { transactions: allTx, totalKredit };
  }

  async getFlashSummary() {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    // Get all active shifts
    const activeShifts = await this.prisma.collectorShift.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    // Get closed shifts from today
    const closedShifts = await this.prisma.collectorShift.findMany({
      where: {
        status: 'CLOSED',
        startTime: { gte: todayStart, lte: todayEnd },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        endTime: 'desc',
      },
    });

    // Calculate total cash in circulation
    const totalCashInHand = activeShifts.reduce((sum, shift) => {
      return sum + Number(shift.startingCash || 0);
    }, 0);

    // Get aggregated stats for all active collectors
    let totalDeposits = 0;
    let totalWithdrawals = 0;
    let totalTransactions = 0;

    const collectorsWithStats: Array<{
      name: string;
      cashInHand: number;
      shiftStartTime: Date;
      deposits: number;
      withdrawals: number;
      transactions: number;
    }> = [];

    for (const shift of activeShifts) {
      const stats = await this.getDailyStats(shift.userId, shift.startTime);
      totalDeposits += stats.todayDeposits;
      totalWithdrawals += stats.todayWithdrawals;
      totalTransactions += stats.todayTransactions;

      collectorsWithStats.push({
        name: shift.user.fullName,
        cashInHand: Number(shift.startingCash || 0),
        shiftStartTime: shift.startTime,
        deposits: stats.todayDeposits,
        withdrawals: stats.todayWithdrawals,
        transactions: stats.todayTransactions,
      });
    }

    // Format closed shifts history
    const closedShiftsHistory = closedShifts.map((shift) => ({
      name: shift.user.fullName,
      startTime: shift.startTime,
      endTime: shift.endTime,
      startingCash: Number(shift.startingCash || 0),
      endingCash: Number(shift.endingCash || 0),
      totalDeposits: Number(shift.totalDeposits || 0),
      totalWithdrawals: Number(shift.totalWithdrawals || 0),
      transactionCount: shift.transactionCount || 0,
    }));

    return {
      activeCollectors: activeShifts.length,
      totalCashInHand,
      totalDeposits,
      totalWithdrawals,
      totalTransactions,
      collectors: collectorsWithStats,
      closedShifts: closedShiftsHistory,
    };
  }
}
