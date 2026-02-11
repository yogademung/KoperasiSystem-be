import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';
import { AccountingService } from '../accounting.service';
import { PeriodLockService } from '../../month-end/period-lock.service';

@Injectable()
export class AssetService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => AccountingService))
    private accountingService: AccountingService,
    private periodLockService: PeriodLockService,
  ) { }

  async create(createAssetDto: any, userId: number) {
    return await this.prisma.$transaction(async (tx) => {
      // 0. DATE & PERIOD VALIDATION
      const acquisitionDate = new Date(createAssetDto.acquisitionDate);
      const period = `${acquisitionDate.getFullYear()}-${String(acquisitionDate.getMonth() + 1).padStart(2, '0')}`;

      const isLocked = await this.periodLockService.isPeriodLocked(period);
      if (isLocked) {
        throw new BadRequestException(`Periode ${period} sudah ditutup. Tidak dapat menambah aset baru pada periode ini.`);
      }

      // 1. GENERATE ASSET CODE IF NOT PROVIDED OR AUTO FORMAT REQUESTED
      let assetCode = createAssetDto.code;
      if (!assetCode || assetCode === 'AUTO') {
        assetCode = await this.generateAssetCode(createAssetDto.acquisitionDate, tx);
      }

      // VALIDATION: Check if all required account codes exist in COA
      // Default Source to '2.20.04' (Hutang Pembelian Aset) if not provided
      const sourceAccount = createAssetDto.sourceAccountId || '2.20.04';

      const accountCodesToValidate = [
        { code: createAssetDto.assetAccountId, name: 'Akun Aset' },
        {
          code: createAssetDto.accumDepreciationAccountId,
          name: 'Akun Akumulasi Penyusutan',
        },
        {
          code: createAssetDto.expenseAccountId,
          name: 'Akun Biaya Penyusutan',
        },
        { code: sourceAccount, name: 'Akun Sumber Dana (Hutang/Kas)' },
      ];

      // Validate all accounts exist
      for (const acc of accountCodesToValidate) {
        const exists = await tx.journalAccount.findUnique({
          where: { accountCode: acc.code },
        });
        if (!exists) {
          throw new Error(
            `${acc.name} dengan kode '${acc.code}' tidak ditemukan di Chart of Accounts. Silakan periksa konfigurasi COA.`,
          );
        }
      }

      // 1. Create Asset
      const asset = await tx.asset.create({
        data: {
          name: createAssetDto.name,
          code: assetCode,
          type: createAssetDto.type,
          acquisitionDate: new Date(createAssetDto.acquisitionDate),
          acquisitionCost: new Prisma.Decimal(createAssetDto.acquisitionCost),
          residualValue: new Prisma.Decimal(createAssetDto.residualValue || 0),
          usefulLifeYears: Number(createAssetDto.usefulLifeYears),
          depreciationRate: Number(createAssetDto.depreciationRate),
          depreciationMethod: createAssetDto.depreciationMethod,
          assetAccountId: createAssetDto.assetAccountId,
          accumDepreciationAccountId: createAssetDto.accumDepreciationAccountId,
          expenseAccountId: createAssetDto.expenseAccountId,
          status: 'ACTIVE',
          createdBy: userId.toString(),
        },
      });

      // 2. Post Journal (Debit Asset, Credit Source/Hutang)
      const date = new Date(createAssetDto.acquisitionDate);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const count = await tx.postedJournal.count({
        where: {
          journalDate: {
            gte: new Date(year, date.getMonth(), 1),
            lt: new Date(year, date.getMonth() + 1, 1),
          },
        },
      });
      const journalNo = `JU/${year}/${month}/${String(count + 1).padStart(4, '0')}`;

      const amount = Number(createAssetDto.acquisitionCost);

      const journal = await tx.postedJournal.create({
        data: {
          journalNumber: journalNo,
          journalDate: date,
          description: `Perolehan Aset ${asset.name} (${asset.code})`,
          postingType: 'AUTO',
          sourceCode: 'ASSET',
          refId: asset.id,
          userId: userId,
          status: 'POSTED',
          transType: 'ASSET_ACQUISITION',
          details: {
            create: [
              {
                accountCode: asset.assetAccountId,
                debit: amount,
                credit: 0,
                description: `Aset: ${asset.name}`,
              },
              {
                accountCode: sourceAccount,
                debit: 0,
                credit: amount,
                description: `Pembelian Aset: ${asset.name} (Via Hutang/Kas)`,
              },
            ],
          },
        },
      });

      return { asset, journal };
    });
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.asset.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.asset.count(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async generateAssetCode(dateStr: string, tx?: Prisma.TransactionClient) {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const codePrefix = `ASSET-${day}${month}${year}-`;

    const prisma = tx || this.prisma;

    // Count existing assets with this prefix to determine sequence
    const existingCount = await prisma.asset.count({
      where: {
        code: { startsWith: codePrefix },
      },
    });

    const sequence = String(existingCount + 1).padStart(3, '0');
    return `${codePrefix}${sequence}`;
  }
  async findOne(id: number) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        depreciationHistory: {
          include: { journal: true },
          orderBy: { period: 'desc' },
        },
      },
    });
    if (!asset) throw new NotFoundException('Asset not found');
    return asset;
  }

  async update(id: number, data: any) {
    const updateData: any = { ...data };
    if (data.acquisitionCost)
      updateData.acquisitionCost = new Prisma.Decimal(data.acquisitionCost);
    if (data.residualValue)
      updateData.residualValue = new Prisma.Decimal(data.residualValue);

    return this.prisma.asset.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: number) {
    return this.prisma.asset.delete({ where: { id } });
  }

  async calculateMonthlyDepreciation(assetId: number, date: Date) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
    });
    if (!asset) throw new NotFoundException('Asset not found');

    if (asset.depreciationMethod === 'STRAIGHT_LINE') {
      // Formula: (Cost - Residual) * (Rate / 100) / 12
      const amount =
        ((Number(asset.acquisitionCost) - Number(asset.residualValue)) *
          (asset.depreciationRate / 100)) /
        12;
      return amount;
    }

    // Default to straight line or implement declining balance if needed
    return 0;
  }

  async runDepreciationProcess(userId: number, date: Date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const period = `${year}-${month}`;

    // 1. Get all active assets
    const assets = await this.prisma.asset.findMany({
      where: {
        status: 'ACTIVE',
        acquisitionDate: { lte: date },
      },
    });

    if (assets.length === 0) {
      return {
        message: 'Tidak ada aset aktif untuk disusutkan',
        processedCount: 0,
      };
    }

    // 2. Validate all accounts exist BEFORE processing
    const uniqueExpenseAccounts = [
      ...new Set(assets.map((a) => a.expenseAccountId)),
    ];
    const uniqueAccumAccounts = [
      ...new Set(assets.map((a) => a.accumDepreciationAccountId)),
    ];
    const allAccountsToValidate = [
      ...uniqueExpenseAccounts,
      ...uniqueAccumAccounts,
    ];

    for (const accountCode of allAccountsToValidate) {
      const exists = await this.prisma.journalAccount.findUnique({
        where: { accountCode },
      });
      if (!exists) {
        throw new Error(
          `Akun '${accountCode}' tidak ditemukan di Chart of Accounts. Periksa konfigurasi aset sebelum menjalankan penyusutan.`,
        );
      }
    }

    const results: { assetId: number; amount: number }[] = [];
    let totalDepreciation = 0;

    const journalEntries: {
      expenseAccount: string;
      accumAccount: string;
      amount: number;
      assetId: number;
    }[] = [];

    for (const asset of assets) {
      // Check if already depreciated for this period
      const existing = await this.prisma.assetDepreciationHistory.findFirst({
        where: { assetId: asset.id, period },
      });

      if (existing) continue;

      const amount = await this.calculateMonthlyDepreciation(asset.id, date);
      if (amount <= 0) continue;

      totalDepreciation += amount;

      journalEntries.push({
        expenseAccount: asset.expenseAccountId,
        accumAccount: asset.accumDepreciationAccountId,
        amount,
        assetId: asset.id,
      });

      results.push({ assetId: asset.id, amount });
    }

    if (journalEntries.length === 0) {
      return {
        message: 'Tidak ada aset yang perlu disusutkan untuk periode ini',
        processedCount: 0,
      };
    }

    // Post Journal (Consolidated)
    return this.prisma.$transaction(async (tx) => {
      const details: {
        accountCode: string;
        debit: number;
        credit: number;
        description: string;
      }[] = [];

      // Group by account to avoid split rows in journal
      const groupedDetails: Map<string, { debit: number; credit: number }> =
        new Map();

      for (const entry of journalEntries) {
        // Debit Expense
        const exp = groupedDetails.get(entry.expenseAccount) || {
          debit: 0,
          credit: 0,
        };
        groupedDetails.set(entry.expenseAccount, {
          debit: exp.debit + entry.amount,
          credit: exp.credit,
        });

        // Credit Accumulated
        const acc = groupedDetails.get(entry.accumAccount) || {
          debit: 0,
          credit: 0,
        };
        groupedDetails.set(entry.accumAccount, {
          debit: acc.debit,
          credit: acc.credit + entry.amount,
        });
      }

      const finalDetails = Array.from(groupedDetails.entries()).map(
        ([code, val]) => ({
          accountCode: code,
          debit: val.debit,
          credit: val.credit,
          description: `Penyusutan Aktiva - ${period}`,
        }),
      );

      // Generate Journal
      const manualData = {
        date: new Date(),
        description: `Penyusutan Aktiva Otomatis - Periode ${period}`,
        userId,
        details: finalDetails,
      };

      const journal =
        await this.accountingService.createManualJournal(manualData);

      // Overwrite postingType to 'AUTO' and sourceCode to 'ASSET'
      await tx.postedJournal.update({
        where: { id: journal.id },
        data: { postingType: 'AUTO', sourceCode: 'ASSET' },
      });

      // Save History
      for (const res of results) {
        await tx.assetDepreciationHistory.create({
          data: {
            assetId: res.assetId,
            period,
            amount: new Prisma.Decimal(res.amount),
            journalId: journal.id,
          },
        });
      }

      return {
        journalId: journal.id,
        processedCount: results.length,
        totalAmount: totalDepreciation,
      };
    });
  }

  async voidTransaction(assetId: number, tx: Prisma.TransactionClient) {
    // Used when Journal is deleted
    return tx.asset.update({
      where: { id: assetId },
      data: { status: 'INACTIVE', updatedBy: 'SYSTEM_VOID' },
    });
  }

  // ==========================================
  // NEW FEATURES: PAYABLE & DISPOSAL
  // ==========================================

  async payAssetPurchase(dto: {
    assetId: number;
    paymentAccountId: string;
    amount: number;
    date?: Date;
    userId: number;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findUnique({
        where: { id: dto.assetId },
      });
      if (!asset) throw new NotFoundException('Asset not found');

      // Create Payment Journal: Debit Hutang Pembelian Aset (2.20.04), Credit Payment Account
      // Assumption: The Purchase Journal credited 2.20.04

      const hutangAccount = '2.20.04'; // Fixed for now, or fetch from config

      const manualData = {
        date: dto.date || new Date(),
        description: `Pembayaran Hutang Aset ${asset.code} - ${asset.name}`,
        userId: dto.userId,
        details: [
          {
            accountCode: hutangAccount,
            debit: dto.amount,
            credit: 0,
            description: `Bayar Hutang Aset ${asset.name}`,
          },
          {
            accountCode: dto.paymentAccountId,
            debit: 0,
            credit: dto.amount,
            description: `Keluar Kas/Bank`,
          },
        ]
      };

      // Reuse createManualJournal logic from accounting service?
      // Or create directly here to keep it atomic in this TX if needed.
      // Better to call accountingService but we need strict transaction binding.
      // AccountingService.createManualJournal is not transaction-aware by default in this codebase styling?
      // It uses prisma.postedJournal.create.
      // Let's create manually here to be safe within TX or use a helper if available.

      // We will duplicate simple logic here to ensure TX consistency
      const date = dto.date || new Date();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const count = await tx.postedJournal.count({
        where: {
          journalDate: {
            gte: new Date(year, date.getMonth(), 1),
            lt: new Date(year, date.getMonth() + 1, 1),
          },
        },
      });
      const journalNo = `JU/${year}/${month}/${String(count + 1).padStart(4, '0')}`;

      const journal = await tx.postedJournal.create({
        data: {
          journalNumber: journalNo,
          journalDate: date,
          description: manualData.description,
          postingType: 'MANUAL', // Or AUTO? Let's say MANUAL payment
          sourceCode: 'ASSET_PAYMENT',
          refId: asset.id,
          userId: dto.userId,
          status: 'POSTED',
          transType: 'ASSET_PAYMENT',
          details: {
            create: manualData.details
          }
        }
      });

      return journal;
    });
  }

  async disposeAsset(dto: {
    assetId: number;
    saleAmount: number;
    paymentAccountId: string; // Cash In
    gainLossAccountId?: string; // Optional user override
    date?: Date;
    userId: number;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findUnique({
        where: { id: dto.assetId },
      });
      if (!asset) throw new NotFoundException('Asset not found');
      if (asset.status !== 'ACTIVE') throw new BadRequestException('Asset is not ACTIVE');

      // Calculate Book Value
      // 1. Get Accum Depreciation
      // We can sum history or use a stored field if we had one. Summing is safer.
      const history = await tx.assetDepreciationHistory.findMany({
        where: { assetId: asset.id },
      });
      const accumDepreciation = history.reduce((sum, h) => sum.plus(h.amount), new Prisma.Decimal(0));

      const acquisitionCost = new Prisma.Decimal(asset.acquisitionCost);
      const bookValue = acquisitionCost.minus(accumDepreciation);

      const saleAmount = new Prisma.Decimal(dto.saleAmount);
      const gainLoss = saleAmount.minus(bookValue);

      // Determine Gain or Loss Account
      let gainLossAccount = dto.gainLossAccountId;

      if (!gainLossAccount) {
        if (gainLoss.greaterThan(0)) {
          gainLossAccount = '4.20.04'; // Default Gain Account
        } else {
          gainLossAccount = '5.40.01'; // Default Loss Account
        }
      }

      // Check Account existence
      const checkAcc = await tx.journalAccount.findUnique({ where: { accountCode: gainLossAccount } });
      if (!checkAcc) throw new BadRequestException(`Gain/Loss Account ${gainLossAccount} not found`);

      // Create Disposal Journal
      // Dr Cash (Sale Amount)
      // Dr Accum Dep (Total Accum)
      // Dr Loss (if any)
      // Cr Asset (Acquisition Cost)
      // Cr Gain (if any)

      const details: any[] = [];

      // 1. Debit Cash (Uang Masuk)
      if (saleAmount.greaterThan(0)) {
        details.push({
          accountCode: dto.paymentAccountId,
          debit: saleAmount.toNumber(),
          credit: 0,
          description: `Penjualan Aset ${asset.name}`
        });
      }

      // 2. Debit Accum Depreciation (Hapus Akumulasi)
      if (accumDepreciation.greaterThan(0)) {
        details.push({
          accountCode: asset.accumDepreciationAccountId,
          debit: accumDepreciation.toNumber(),
          credit: 0,
          description: `Hapus Akumulasi ${asset.name}`
        });
      }

      // 3. Credit Asset (Hapus Aset - Cost)
      details.push({
        accountCode: asset.assetAccountId,
        debit: 0,
        credit: acquisitionCost.toNumber(),
        description: `Hapus Aset ${asset.name}`
      });

      // 4. Gain / Loss
      if (gainLoss.greaterThan(0)) {
        // GAIN -> Credit
        details.push({
          accountCode: gainLossAccount,
          debit: 0,
          credit: gainLoss.toNumber(),
          description: `Keuntungan Penjualan Aset`
        });
      } else if (gainLoss.lessThan(0)) {
        // LOSS -> Debit
        // gainLoss is negative, enable abs
        details.push({
          accountCode: gainLossAccount,
          debit: gainLoss.abs().toNumber(),
          credit: 0,
          description: `Kerugian Penjualan Aset`
        });
      }

      const date = dto.date || new Date();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const count = await tx.postedJournal.count({
        where: {
          journalDate: {
            gte: new Date(year, date.getMonth(), 1),
            lt: new Date(year, date.getMonth() + 1, 1),
          },
        },
      });
      const journalNo = `JU/${year}/${month}/${String(count + 1).padStart(4, '0')}`;

      const journal = await tx.postedJournal.create({
        data: {
          journalNumber: journalNo,
          journalDate: date,
          description: `Penjualan/Disposal Aset ${asset.name}`,
          postingType: 'AUTO',
          sourceCode: 'ASSET_DISPOSAL',
          refId: asset.id,
          userId: dto.userId,
          status: 'POSTED',
          transType: 'ASSET_DISPOSAL',
          details: {
            create: details
          }
        }
      });

      // Update Asset Status
      await tx.asset.update({
        where: { id: asset.id },
        data: { status: 'DISPOSED', updatedBy: dto.userId.toString() }
      });

      return { journal, gainLoss: gainLoss.toNumber() };
    });
  }

  // ============================
  // REPORTING METHODS
  // ============================

  async getBalanceSheet(date: Date) {
    // AK80a: List of Assets and their current Book Values
    const assets = await this.prisma.asset.findMany({
      where: {
        acquisitionDate: { lte: date },
        status: 'ACTIVE', // Or include SOLD/DISPOSED based on requirements
      },
    });

    // For each asset, calculate book value as of date
    const reportData = await Promise.all(
      assets.map(async (asset) => {
        // Get accum depreciation up to date
        const history = await this.prisma.assetDepreciationHistory.findMany({
          where: {
            assetId: asset.id,
            period: {
              lte: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
            },
          },
        });

        const totalDepreciation = history.reduce(
          (sum, h) => sum.plus(h.amount),
          new Prisma.Decimal(0),
        );
        const bookValue = new Prisma.Decimal(asset.acquisitionCost).minus(
          totalDepreciation,
        );

        return {
          id: asset.id,
          code: asset.code,
          name: asset.name,
          type: asset.type,
          acquisitionCost: asset.acquisitionCost,
          accumulatedDepreciation: totalDepreciation,
          bookValue: bookValue,
        };
      }),
    );

    // Group by Type (AKTIVA TETAP based on COA mapping usually)
    return {
      date,
      totalAcquisition: reportData.reduce(
        (sum, r) => sum.plus(r.acquisitionCost),
        new Prisma.Decimal(0),
      ),
      totalBookValue: reportData.reduce(
        (sum, r) => sum.plus(r.bookValue),
        new Prisma.Decimal(0),
      ),
      details: reportData,
    };
  }

  async getAssetMutations(startDate: Date, endDate: Date) {
    // AK81: Asset Mutations
    // 1. Acquisitions in period
    const acquisitions = await this.prisma.asset.findMany({
      where: {
        acquisitionDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        name: true,
        code: true,
        acquisitionDate: true,
        acquisitionCost: true,
      },
    });

    // 2. Depreciations in period
    const startPeriod = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
    const endPeriod = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}`;

    const depreciations = await this.prisma.assetDepreciationHistory.findMany({
      where: {
        period: { gte: startPeriod, lte: endPeriod },
      },
      include: { asset: { select: { name: true, code: true } } },
    });

    return {
      startDate,
      endDate,
      acquisitions: acquisitions.map((a) => ({
        type: 'ACQUISITION',
        date: a.acquisitionDate,
        asset: `${a.name} (${a.code})`,
        amount: a.acquisitionCost,
      })),
      depreciations: depreciations.map((d) => ({
        type: 'DEPRECIATION',
        period: d.period,
        asset: `${d.asset.name} (${d.asset.code})`,
        amount: d.amount,
      })),
    };
  }


}
