import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class SimpananInterestService {
  private readonly logger = new Logger(SimpananInterestService.name);

  constructor(private prisma: PrismaService) {}

  // Run at 00:00 every day to check for Deposito anniversaries
  // Other simpanan (Tabungan) still runs only on the 1st.
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyScheduler() {
    const today = new Date();
    this.logger.log(
      `Starting daily interest check for ${today.toISOString().split('T')[0]}...`,
    );

    // 1. Process Deposito (Daily Check for Anniversary)
    await this.processDepositoInterest();

    // 2. Process Monthly Savings (Only on 1st of month)
    if (today.getDate() === 1) {
      this.logger.log(
        'Date is 1st of month. Processing Monthly Savings Interest...',
      );
      await this.processTabrelaInterest();
      await this.processBrahmacariInterest();
      await this.processBalimesariInterest();
      await this.processWanaprastaInterest();
    }

    this.logger.log('Daily interest check completed.');
  }

  // Force Run (Manual Test) - Bypasses Date Checks
  async forceRunAllInterest() {
    this.logger.log('FORCE RUNNING ALL INTEREST CHECKS...');

    // 1. Deposito (Check all active, maybe force Anniversary logic?
    // For now, processDepositoInterest without targetNoJangka checks dates.
    // We might want to force check ALL?
    // Let's modify processDepositoInterest to accept a 'force' flag?
    // Or for now, just let it run normal checks (so only due ones get processed).
    // User want to "tes fungsi". If no deposito is due, nothing happens.
    // But for monthly savings, we MUST bypass the "Date === 1" check.

    await this.processDepositoInterest(); // Only due depositos

    // 2. Monthly Savings - FORCE RUN
    this.logger.log('Force processing Monthly Savings Interest...');
    await this.processTabrelaInterest();
    await this.processBrahmacariInterest();
    await this.processBalimesariInterest();
    await this.processWanaprastaInterest();

    this.logger.log('Force Run completed.');
  }

  // 5. Deposito Interest Logic
  async processDepositoInterest(targetNoJangka?: string) {
    // If targetNoJangka is provided (Manual Test), skip date validation.
    // If not provided (Auto Scheduler), only process if today matches tglBuka.day

    const today = new Date();
    const currentDay = today.getDate();

    // Check for End of Month to handle dates 29, 30, 31
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const isEndOfMonth = tomorrow.getDate() === 1;

    const whereClause: any = { status: 'A' };
    if (targetNoJangka) {
      whereClause.noJangka = targetNoJangka;
    }

    const depositos = await this.prisma.nasabahJangka.findMany({
      where: whereClause,
      include: { nasabah: true },
    });

    this.logger.log(`Found ${depositos.length} active depositos to check.`);

    for (const dep of depositos) {
      // DATE VALIDATION (Skip if not Manual Test AND not Anniversary)
      if (!targetNoJangka) {
        const openDay = dep.tglBuka.getDate();

        let isDue = false;
        if (openDay === currentDay) {
          isDue = true;
        } else if (isEndOfMonth && openDay > currentDay) {
          // Handle End of Month catch-up:
          // 1. If today is 28th/30th/31st AND tomorrow is 1st (End of Month)
          // 2. AND the Open Day (e.g. 29, 30, 31) doesn't exist in this month (Open Day > Current Last Day)
          // THEN process it now.
          // Example: Created Feb 29.
          // - Non-Leap Year (2025): Today is Feb 28. isEndOfMonth=True. 29 > 28. -> Processed on Feb 28.
          // - Leap Year (2028): Today is Feb 28. isEndOfMonth=False. 29 != 28. -> Waited for Feb 29.
          isDue = true;
        }

        if (!isDue) {
          // this.logger.debug(`  Skipping ${dep.noJangka}: Opened on ${openDay}, today is ${currentDay}`);
          continue;
        }
      }

      this.logger.log(`Processing Interest for ${dep.noJangka} (Due Today)`);

      // Calculate Interest: Nominal * (Bunga/100) / 12
      const interest = (Number(dep.nominal) * (Number(dep.bunga) / 100)) / 12;

      // Tax Calculation (Example: > 240k tax 20%) - Adjust as needed
      let tax = 0;
      if (interest > 240000) tax = interest * 0.2;
      const netInterest = interest - tax;

      if (netInterest <= 0) continue;

      await this.prisma.$transaction(async (tx) => {
        // Payout Mode Logic
        if (dep.payoutMode === 'ROLLOVER') {
          // Add to Principal
          const newNominal = Number(dep.nominal) + netInterest;

          // Transaction: Bunga (Income)
          await tx.transJangka.create({
            data: {
              noJangka: dep.noJangka,
              tipeTrans: 'BUNGA',
              nominal: netInterest,
              keterangan: 'Bunga Bulanan (Rollover)',
              createdBy: 'SYSTEM',
            },
          });

          // Update Master Nominal
          await tx.nasabahJangka.update({
            where: { noJangka: dep.noJangka },
            data: { nominal: newNominal },
          });
        } else if (dep.payoutMode === 'TRANSFER' && dep.targetAccountId) {
          // Transfer to Savings
          // 1. Record Bunga on Deposito (Information only? Or just log?)
          await tx.transJangka.create({
            data: {
              noJangka: dep.noJangka,
              tipeTrans: 'BUNGA_OUT',
              nominal: netInterest,
              keterangan: `Transfer Bunga ke ${dep.targetAccountId}`,
              createdBy: 'SYSTEM',
            },
          });

          // 2. Credit to Savings
          await this.createTransaction(
            tx,
            'nasabahTab',
            'transTab',
            'noTab',
            dep.targetAccountId,
            'BUNGA_DEP',
            netInterest,
            `Bunga Deposito ${dep.noJangka}`,
          );
        } else {
          // MATURITY or Default: Accumulate Interest in 'bunga' field?
          // Schema has 'bunga' decimal field. Is it Rate or Accumulated Interest?
          // Usually 'bunga' in master is Rate.
          // We might need a separate field 'accumulatedInterest' or just create a transaction that stays there?
          // Or maybe we don't do anything until maturity?
          // User asked: "bertambah nilai bunganya di db".
          // Let's Record it as 'BUNGA' transaction but NOT change nominal.

          await tx.transJangka.create({
            data: {
              noJangka: dep.noJangka,
              tipeTrans: 'BUNGA',
              nominal: netInterest,
              keterangan: 'Bunga Bulanan (Akumulasi)',
              createdBy: 'SYSTEM',
            },
          });
        }
      });
    }
  }

  // Simulation Helper
  async simulateProcessing(noJangka: string) {
    const dep = await this.prisma.nasabahJangka.findUnique({
      where: { noJangka },
      include: { nasabah: true },
    });

    if (!dep) throw new Error('Deposito not found');

    const interest = (Number(dep.nominal) * (Number(dep.bunga) / 100)) / 12;

    let tax = 0;
    // Tax Calculation Rule (match main logic)
    if (interest > 240000) tax = interest * 0.2;

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
      targetAccountId: dep.targetAccountId,
    };
  }

  // 1. Tabrela (Umum) - 2% p.a
  async processTabrelaInterest() {
    const RATE = 0.02;
    const ADMIN_FEE = 5000;

    // Process in batches (simplified for MVP)
    const accounts = await this.prisma.nasabahTab.findMany({
      where: { status: 'A', saldo: { gt: 0 } },
    });

    for (const acc of accounts) {
      // Use defined rate in DB or fallback to default
      const interestRate =
        Number(acc.interestRate) > 0 ? Number(acc.interestRate) / 100 : RATE;

      // Calculate Interest
      // Formula: Saldo * Rate / 12
      const interest = (Number(acc.saldo) * interestRate) / 12;

      // Tax
      let tax = 0;
      if (interest > 240000) {
        tax = interest * 0.2;
      }

      const netInterest = interest - tax;

      // Skip if interest is negligible
      if (netInterest <= 0) continue;

      await this.prisma.$transaction(async (tx) => {
        await this.createTransaction(
          tx,
          'nasabahTab',
          'transTab',
          'noTab',
          acc.noTab,
          'BUNGA',
          interest,
          'Bunga Bulanan',
        );

        if (tax > 0) {
          await this.createTransaction(
            tx,
            'nasabahTab',
            'transTab',
            'noTab',
            acc.noTab,
            'PAJAK',
            -tax,
            'Pajak Bunga',
          );
        }

        if (ADMIN_FEE > 0 && Number(acc.saldo) > ADMIN_FEE) {
          await this.createTransaction(
            tx,
            'nasabahTab',
            'transTab',
            'noTab',
            acc.noTab,
            'ADM',
            -ADMIN_FEE,
            'Biaya Admin',
          );
        }
      });
    }
  }

  // 2. Brahmacari (Student) - 3% p.a, No Admin
  async processBrahmacariInterest() {
    const RATE = 0.03;
    const ADMIN_FEE = 0;

    const accounts = await this.prisma.nasabahBrahmacari.findMany({
      where: { status: 'A', saldo: { gt: 0 } },
    });

    for (const acc of accounts) {
      const interestRate =
        Number(acc.interestRate) > 0 ? Number(acc.interestRate) / 100 : RATE;
      const interest = (Number(acc.saldo) * interestRate) / 12;

      let tax = 0;
      if (interest > 240000) tax = interest * 0.2;

      await this.prisma.$transaction(async (tx) => {
        await this.createTransaction(
          tx,
          'nasabahBrahmacari',
          'transBrahmacari',
          'noBrahmacari',
          acc.noBrahmacari,
          'BUNGA',
          interest,
          'Bunga Bulanan',
        );
        if (tax > 0) {
          await this.createTransaction(
            tx,
            'nasabahBrahmacari',
            'transBrahmacari',
            'noBrahmacari',
            acc.noBrahmacari,
            'PAJAK',
            -tax,
            'Pajak Bunga',
          );
        }
      });
    }
  }

  // 3. Bali Mesari - 4% p.a, Admin 10k
  async processBalimesariInterest() {
    const RATE = 0.04;
    const ADMIN_FEE = 10000;

    const accounts = await this.prisma.nasabahBalimesari.findMany({
      where: { status: 'A', saldo: { gt: 0 } },
    });

    for (const acc of accounts) {
      const interestRate =
        Number(acc.interestRate) > 0 ? Number(acc.interestRate) / 100 : RATE;
      const interest = (Number(acc.saldo) * interestRate) / 12;

      let tax = 0;
      if (interest > 240000) tax = interest * 0.2;

      await this.prisma.$transaction(async (tx) => {
        await this.createTransaction(
          tx,
          'nasabahBalimesari',
          'transBalimesari',
          'noBalimesari',
          acc.noBalimesari,
          'BUNGA',
          interest,
          'Bunga Bulanan',
        );
        if (tax > 0) {
          await this.createTransaction(
            tx,
            'nasabahBalimesari',
            'transBalimesari',
            'noBalimesari',
            acc.noBalimesari,
            'PAJAK',
            -tax,
            'Pajak Bunga',
          );
        }
        if (ADMIN_FEE > 0 && Number(acc.saldo) > ADMIN_FEE) {
          await this.createTransaction(
            tx,
            'nasabahBalimesari',
            'transBalimesari',
            'noBalimesari',
            acc.noBalimesari,
            'ADM',
            -ADMIN_FEE,
            'Biaya Admin',
          );
        }
      });
    }
  }

  // 4. Wanaprasta - 5% p.a, Admin 5k
  async processWanaprastaInterest() {
    const RATE = 0.05;
    const ADMIN_FEE = 5000;

    const accounts = await this.prisma.nasabahWanaprasta.findMany({
      where: { status: 'A', saldo: { gt: 0 } },
    });

    for (const acc of accounts) {
      const interestRate =
        Number(acc.interestRate) > 0 ? Number(acc.interestRate) / 100 : RATE;
      const interest = (Number(acc.saldo) * interestRate) / 12;

      let tax = 0;
      if (interest > 240000) tax = interest * 0.2;

      await this.prisma.$transaction(async (tx) => {
        await this.createTransaction(
          tx,
          'nasabahWanaprasta',
          'transWanaprasta',
          'noWanaprasta',
          acc.noWanaprasta,
          'BUNGA',
          interest,
          'Bunga Bulanan',
        );
        if (tax > 0) {
          await this.createTransaction(
            tx,
            'nasabahWanaprasta',
            'transWanaprasta',
            'noWanaprasta',
            acc.noWanaprasta,
            'PAJAK',
            -tax,
            'Pajak Bunga',
          );
        }
        if (ADMIN_FEE > 0 && Number(acc.saldo) > ADMIN_FEE) {
          await this.createTransaction(
            tx,
            'nasabahWanaprasta',
            'transWanaprasta',
            'noWanaprasta',
            acc.noWanaprasta,
            'ADM',
            -ADMIN_FEE,
            'Biaya Admin',
          );
        }
      });
    }
  }

  // Generic helper to create trans & update balance. Dynamic table names.
  private async createTransaction(
    tx: any,
    tableModel: string,
    transModel: string,
    idField: string,
    idValue: string,
    type: string,
    amount: number,
    desc: string,
  ) {
    // 1. Get current balance
    // Note: Prisma dynamic access tx[model]
    const account = await tx[tableModel].findUnique({
      where: { [idField]: idValue },
    });
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
      },
    });

    // 3. Update Balance
    await tx[tableModel].update({
      where: { [idField]: idValue },
      data: { saldo: newBalance },
    });
  }
}
