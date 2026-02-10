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

@Injectable()
export class AssetService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => AccountingService))
    private accountingService: AccountingService,
  ) {}

  async create(createAssetDto: any, userId: number) {
    return this.prisma.$transaction(async (tx) => {
      // VALIDATION: Check if all required account codes exist in COA
      const sourceAccount = createAssetDto.sourceAccountId || '10100';
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
        { code: sourceAccount, name: 'Akun Sumber Dana' },
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
          code: createAssetDto.code,
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

      // 2. Post Journal (Debit Asset, Credit Source/Cash)
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
                description: `Pembelian Aset: ${asset.name}`,
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
        orderBy: { code: 'asc' },
      }),
      this.prisma.asset.count(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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
