import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PdfService } from './pdf.service';
import { ExcelService } from './excel.service';

@Injectable()
export class LaporanService {
  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
    private excelService: ExcelService,
  ) { }

  async generateSimpananRekap(params: {
    startDate: Date;
    endDate: Date;
    regionCode?: string;
    format: 'PDF' | 'EXCEL';
  }) {
    // 1. Query data with grouping (Aggregated by System/Region in real app, here simple list or global sum)
    // To make it meaningful, let's group by product type (Tabrela, Deposito, etc) or just list accounts
    // The prompt suggested grouping by regionCode.

    // Note: Prisma groupBy has limitations. Let's use aggregate or raw query if needed.
    // Here we stick to the prompt's idea: group by regionCode.
    const data = await this.prisma.anggotaAccount.groupBy({
      by: ['regionCode'],
      where: {
        openDate: {
          gte: params.startDate,
          lte: params.endDate,
        },
        ...(params.regionCode && { regionCode: params.regionCode }),
      },
      _sum: {
        balance: true,
        principal: true,
        mandatoryInit: true,
      },
      _count: {
        accountNumber: true,
      },
    });

    // 2. Format data for report
    const formattedData = data.map((item) => ({
      'Kode Wilayah': item.regionCode || 'PUSAT',
      'Jumlah Rekening': item._count.accountNumber,
      'Total Pokok': this.formatCurrency(Number(item._sum.principal)),
      'Total Wajib': this.formatCurrency(Number(item._sum.mandatoryInit)),
      'Total Saldo': this.formatCurrency(Number(item._sum.balance)),
    }));

    // 3. Calculate totals
    const totals = {
      'Total Rekening': data.reduce(
        (sum, item) => sum + item._count.accountNumber,
        0,
      ),
      'Sum Pokok': data.reduce(
        (sum, item) => sum + Number(item._sum.principal),
        0,
      ),
      'Sum Wajib': data.reduce(
        (sum, item) => sum + Number(item._sum.mandatoryInit),
        0,
      ),
      'Sum Saldo': data.reduce(
        (sum, item) => sum + Number(item._sum.balance),
        0,
      ),
    };

    // 4. Generate report
    if (params.format === 'PDF') {
      return this.pdfService.generate({
        title: 'REKAP SIMPANAN ANGGOTA',
        period: `${this.formatDate(params.startDate)} s/d ${this.formatDate(params.endDate)}`,
        data: formattedData,
        totals,
      });
    } else {
      return this.excelService.generate({
        title: 'REKAP SIMPANAN ANGGOTA',
        period: `${this.formatDate(params.startDate)} s/d ${this.formatDate(params.endDate)}`,
        columns: [
          'Kode Wilayah',
          'Jumlah Rekening',
          'Total Pokok',
          'Total Wajib',
          'Total Saldo',
        ],
        data: formattedData,
        totals,
      });
    }
  }

  async generateTabrelaRekap(params: any) {
    return this.generateGenericProductRekap(
      'NasabahTab',
      'REKAP TABUNGAN SUKARELA (TABRELA)',
      params,
    );
  }

  async generateBrahmacariRekap(params: any) {
    return this.generateGenericProductRekap(
      'NasabahBrahmacari',
      'REKAP BRAHMACARI',
      params,
    );
  }

  async generateBalimesariRekap(params: any) {
    return this.generateGenericProductRekap(
      'NasabahBalimesari',
      'REKAP BALIMESARI',
      params,
    );
  }

  async generateWanaprastaRekap(params: any) {
    return this.generateGenericProductRekap(
      'NasabahWanaprasta',
      'REKAP WANAPRASTA',
      params,
    );
  }

  async generateDepositoRekap(params: any) {
    return this.generateGenericProductRekap(
      'NasabahJangka',
      'REKAP DEPOSITO',
      params,
      'nominal',
    );
  }

  private async generateGenericProductRekap(
    modelName:
      | 'NasabahTab'
      | 'NasabahBrahmacari'
      | 'NasabahBalimesari'
      | 'NasabahWanaprasta'
      | 'NasabahJangka',
    title: string,
    params: { startDate: Date; endDate: Date; format: 'PDF' | 'EXCEL' },
    balanceField: string = 'saldo',
  ) {
    // @ts-ignore
    const delegate =
      this.prisma[modelName.charAt(0).toLowerCase() + modelName.slice(1)];

    const data = await delegate.groupBy({
      by: ['status'],
      where: {
        tglBuka: {
          lte: params.endDate,
        },
      },
      _sum: {
        [balanceField]: true,
      },
      _count: {
        [modelName === 'NasabahTab'
          ? 'noTab'
          : modelName === 'NasabahJangka'
            ? 'noJangka'
            : `no${modelName.replace('Nasabah', '')}`]: true,
      },
    });

    const formattedData = data.map((item: any) => ({
      Status: item.status === 'A' ? 'AKTIF' : 'TUTUP',
      'Jumlah Rekening': Object.values(item._count)[0],
      'Total Saldo': this.formatCurrency(Number(item._sum[balanceField] || 0)),
    }));

    const totals = {
      'Total Rekening': data.reduce(
        (sum: number, item: any) => sum + Number(Object.values(item._count)[0]),
        0,
      ),
      'Sum Saldo': data.reduce(
        (sum: number, item: any) => sum + Number(item._sum[balanceField] || 0),
        0,
      ),
    };

    if (params.format === 'PDF') {
      return this.pdfService.generate({
        title,
        period: `${this.formatDate(params.startDate)} s/d ${this.formatDate(params.endDate)}`,
        data: formattedData,
        totals,
      });
    } else {
      return this.excelService.generate({
        title,
        period: `${this.formatDate(params.startDate)} s/d ${this.formatDate(params.endDate)}`,
        columns: ['Status', 'Jumlah Rekening', 'Total Saldo'],
        data: formattedData,
        totals,
      });
    }
  }

  async generateMutasiSimpanan(params: {
    startDate: Date;
    endDate: Date;
    productType: string;
    format: 'PDF' | 'EXCEL';
  }) {
    let data: any[] = [];
    let title = '';

    // Determine which model and table to query based on product type
    switch (params.productType) {
      case 'ANGGOTA':
        title = 'MUTASI SIMPANAN ANGGOTA';
        data = await this.prisma.anggotaTransaction.findMany({
          where: {
            transDate: { gte: params.startDate, lte: params.endDate },
          },
          include: { account: { include: { customer: true } } },
          orderBy: { transDate: 'asc' },
        });
        break;
      case 'TABRELA':
        title = 'MUTASI TABUNGAN SUKARELA';
        data = await this.prisma.transTab.findMany({
          where: {
            createdAt: { gte: params.startDate, lte: params.endDate },
          },
          include: { tabungan: { include: { nasabah: true } } },
          orderBy: { createdAt: 'asc' },
        });
        break;
      case 'BRAHMACARI':
        title = 'MUTASI BRAHMACARI';
        data = await this.prisma.transBrahmacari.findMany({
          where: {
            createdAt: { gte: params.startDate, lte: params.endDate },
          },
          include: { brahmacari: { include: { nasabah: true } } },
          orderBy: { createdAt: 'asc' },
        });
        break;
      case 'BALIMESARI':
        title = 'MUTASI BALIMESARI';
        data = await this.prisma.transBalimesari.findMany({
          where: {
            createdAt: { gte: params.startDate, lte: params.endDate },
          },
          include: { balimesari: { include: { nasabah: true } } },
          orderBy: { createdAt: 'asc' },
        });
        break;
      case 'WANAPRASTA':
        title = 'MUTASI WANAPRASTA';
        data = await this.prisma.transWanaprasta.findMany({
          where: {
            createdAt: { gte: params.startDate, lte: params.endDate },
          },
          include: { wanaprasta: { include: { nasabah: true } } },
          orderBy: { createdAt: 'asc' },
        });
        break;
      case 'DEPOSITO':
        title = 'MUTASI DEPOSITO';
        data = await this.prisma.transJangka.findMany({
          where: {
            createdAt: { gte: params.startDate, lte: params.endDate },
          },
          include: { deposito: { include: { nasabah: true } } },
          orderBy: { createdAt: 'asc' },
        });
        break;
      default:
        throw new Error('Invalid product type');
    }

    const formattedData = data.map((item: any) => {
      // Normalizing fields depending on source
      const date = item.transDate || item.createdAt;
      const accountNo =
        item.accountNumber ||
        item.noTab ||
        item.noBrahmacari ||
        item.noBalimesari ||
        item.noWanaprasta ||
        item.noJangka;
      const name =
        item.account?.customer?.nama ||
        item.tabungan?.nasabah?.nama ||
        item.brahmacari?.nasabah?.nama ||
        item.balimesari?.nasabah?.nama ||
        item.wanaprasta?.nasabah?.nama ||
        item.deposito?.nasabah?.nama ||
        'N/A';
      const type = item.transType || item.tipeTrans; // e.g. 'SETOR', 'TARIK'

      // Logic for Debit/Credit Columns suitable for report
      const nominal = Number(item.amount || item.nominal || 0);

      // Assuming simplified view: just nominal and type.
      // Ideally we split into Debit/Credit columns based on type.
      // Heuristic: Setor/Credit = In, Tarik/Debit = Out.
      // But 'transType' might be raw codes. Let's list Type and Nominal.

      return {
        Tanggal: this.formatDate(date),
        'No. Rekening': accountNo,
        'Nama Nasabah': name,
        'Tipe Transaksi': type,
        Keterangan: item.description || item.keterangan || '-',
        Nominal: this.formatCurrency(nominal),
      };
    });

    if (params.format === 'PDF') {
      return this.pdfService.generate({
        title,
        period: `${this.formatDate(params.startDate)} s/d ${this.formatDate(params.endDate)}`,
        data: formattedData,
        orientation: 'landscape', // More columns, landscape preferred
      });
    } else {
      return this.excelService.generate({
        title,
        period: `${this.formatDate(params.startDate)} s/d ${this.formatDate(params.endDate)}`,
        columns: [
          'Tanggal',
          'No. Rekening',
          'Nama Nasabah',
          'Tipe Transaksi',
          'Keterangan',
          'Nominal',
        ],
        data: formattedData,
      });
    }
  }

  async generateDaftarRekening(params: {
    productType: string;
    format: 'PDF' | 'EXCEL';
  }) {
    let data: any[] = [];
    let title = '';

    // Fetch account data based on product type
    switch (params.productType) {
      case 'ANGGOTA':
        title = 'DAFTAR REKENING SIMPANAN ANGGOTA';
        data = await this.prisma.anggotaAccount.findMany({
          where: { isActive: true },
          include: { customer: true },
          orderBy: { accountNumber: 'asc' },
        });
        break;
      case 'TABRELA':
        title = 'DAFTAR REKENING TABUNGAN SUKARELA';
        data = await this.prisma.nasabahTab.findMany({
          where: { status: 'A' },
          include: { nasabah: true },
          orderBy: { noTab: 'asc' },
        });
        break;
      case 'BRAHMACARI':
        title = 'DAFTAR REKENING BRAHMACARI';
        data = await this.prisma.nasabahBrahmacari.findMany({
          where: { status: 'A' },
          include: { nasabah: true },
          orderBy: { noBrahmacari: 'asc' },
        });
        break;
      case 'BALIMESARI':
        title = 'DAFTAR REKENING BALIMESARI';
        data = await this.prisma.nasabahBalimesari.findMany({
          where: { status: 'A' },
          include: { nasabah: true },
          orderBy: { noBalimesari: 'asc' },
        });
        break;
      case 'WANAPRASTA':
        title = 'DAFTAR REKENING WANAPRASTA';
        data = await this.prisma.nasabahWanaprasta.findMany({
          where: { status: 'A' },
          include: { nasabah: true },
          orderBy: { noWanaprasta: 'asc' },
        });
        break;
      case 'DEPOSITO':
        title = 'DAFTAR REKENING DEPOSITO';
        data = await this.prisma.nasabahJangka.findMany({
          where: { status: 'A' },
          include: { nasabah: true },
          orderBy: { noJangka: 'asc' },
        });
        break;
      default:
        throw new Error('Invalid product type');
    }

    const formattedData = data.map((item: any) => {
      // Normalize fields based on product type
      const accountNo =
        item.accountNumber ||
        item.noTab ||
        item.noBrahmacari ||
        item.noBalimesari ||
        item.noWanaprasta ||
        item.noJangka;
      const customerName = item.customer?.nama || item.nasabah?.nama || 'N/A';
      const openDate = item.openDate || item.tglBuka;
      const balance = item.balance || item.saldo || item.nominal || 0;
      const status = item.status === 'A' || item.isActive ? 'AKTIF' : 'TUTUP';

      return {
        'No. Rekening': accountNo,
        'Nama Nasabah': customerName,
        'Tanggal Buka': this.formatDate(openDate),
        Saldo: this.formatCurrency(Number(balance)),
        Status: status,
      };
    });

    if (params.format === 'PDF') {
      return this.pdfService.generate({
        title,
        period: `Per ${this.formatDate(new Date())}`,
        data: formattedData,
        orientation: 'landscape',
      });
    } else {
      return this.excelService.generate({
        title,
        period: `Per ${this.formatDate(new Date())}`,
        columns: [
          'No. Rekening',
          'Nama Nasabah',
          'Tanggal Buka',
          'Saldo',
          'Status',
        ],
        data: formattedData,
      });
    }
  }

  async generateNeraca(params: {
    date: Date;
    format: 'PDF' | 'EXCEL';
    businessUnitId?: number;
  }) {
    const title = params.businessUnitId
      ? `NERACA UNIT KERJA ${params.businessUnitId}`
      : 'NERACA KONSOLIDASI';

    // Get all journal details up to the specified date
    const journalDetails = await this.prisma.postedJournalDetail.findMany({
      where: {
        journal: {
          journalDate: { lte: params.date },
          status: 'POSTED',
        },
        ...(params.businessUnitId && {
          account: {
            businessUnitId: params.businessUnitId,
          },
        }),
      },
      include: {
        account: true,
      },
    });

    // Aggregate balances by account
    const accountBalances = new Map<
      string,
      {
        accountCode: string;
        accountName: string;
        accountType: string;
        debit: number;
        credit: number;
        balance: number;
      }
    >();

    journalDetails.forEach((detail) => {
      const key = detail.accountCode;
      if (!accountBalances.has(key)) {
        accountBalances.set(key, {
          accountCode: detail.account.accountCode,
          accountName: detail.account.accountName,
          accountType: detail.account.accountType,
          debit: 0,
          credit: 0,
          balance: 0,
        });
      }

      const acc = accountBalances.get(key)!;
      acc.debit += Number(detail.debit);
      acc.credit += Number(detail.credit);

      // Calculate balance based on normal balance (debit or credit)
      if (detail.account.debetPoleFlag) {
        // Debit normal account (Assets, Expenses)
        acc.balance = acc.debit - acc.credit;
      } else {
        // Credit normal account (Liabilities, Equity, Revenue)
        acc.balance = acc.credit - acc.debit;
      }
    });

    // Group by account type
    const assets: any[] = [];
    const liabilities: any[] = [];
    const equity: any[] = [];

    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;

    accountBalances.forEach((acc) => {
      const item = {
        'Kode Akun': acc.accountCode,
        'Nama Akun': acc.accountName,
        Saldo: this.formatKiloIDR(acc.balance),
      };

      if (acc.accountType === 'AST') {
        assets.push(item);
        totalAssets += acc.balance;
      } else if (acc.accountType === 'LIA') {
        liabilities.push(item);
        totalLiabilities += acc.balance;
      } else if (acc.accountType === 'EQT') {
        equity.push(item);
        totalEquity += acc.balance;
      }
    });

    // Format data for report
    const formattedData = [
      { section: 'ASET (ASSETS)', data: assets, total: totalAssets },
      {
        section: 'KEWAJIBAN (LIABILITIES)',
        data: liabilities,
        total: totalLiabilities,
      },
      { section: 'EKUITAS (EQUITY)', data: equity, total: totalEquity },
    ];

    // Calculate balance check
    const totalPassiva = totalLiabilities + totalEquity;
    const balanceDifference = totalAssets - totalPassiva;
    const isBalanced = Math.abs(balanceDifference) < 0.01; // Allow 1 cent tolerance for rounding

    if (params.format === 'PDF') {
      // For PDF, flatten the structure
      const pdfData: any[] = [];

      // Assets section
      pdfData.push({
        'Kode Akun': 'ASET (ASSETS)',
        'Nama Akun': '',
        Saldo: '',
      });
      pdfData.push(...assets);
      pdfData.push({
        'Kode Akun': '',
        'Nama Akun': 'Total Aset',
        Saldo: this.formatKiloIDR(totalAssets),
      });
      pdfData.push({ 'Kode Akun': '', 'Nama Akun': '', Saldo: '' });

      // Liabilities section
      pdfData.push({
        'Kode Akun': 'KEWAJIBAN (LIABILITIES)',
        'Nama Akun': '',
        Saldo: '',
      });
      pdfData.push(...liabilities);
      pdfData.push({
        'Kode Akun': '',
        'Nama Akun': 'Total Kewajiban',
        Saldo: this.formatKiloIDR(totalLiabilities),
      });
      pdfData.push({ 'Kode Akun': '', 'Nama Akun': '', Saldo: '' });

      // Equity section
      pdfData.push({
        'Kode Akun': 'EKUITAS (EQUITY)',
        'Nama Akun': '',
        Saldo: '',
      });
      pdfData.push(...equity);
      pdfData.push({
        'Kode Akun': '',
        'Nama Akun': 'Total Ekuitas',
        Saldo: this.formatKiloIDR(totalEquity),
      });
      pdfData.push({ 'Kode Akun': '', 'Nama Akun': '', Saldo: '' });

      // Balance Check Section
      pdfData.push({
        'Kode Akun': '═══════════════════════════════════',
        'Nama Akun': '',
        Saldo: '',
      });
      pdfData.push({
        'Kode Akun': 'VERIFIKASI NERACA',
        'Nama Akun': '',
        Saldo: '',
      });
      pdfData.push({
        'Kode Akun': '',
        'Nama Akun': 'Total Aset (Aktiva)',
        Saldo: this.formatKiloIDR(totalAssets),
      });
      pdfData.push({
        'Kode Akun': '',
        'Nama Akun': 'Total Pasiva (Kewajiban + Ekuitas)',
        Saldo: this.formatKiloIDR(totalPassiva),
      });
      pdfData.push({
        'Kode Akun': '',
        'Nama Akun': 'Selisih',
        Saldo: this.formatKiloIDR(balanceDifference),
      });
      pdfData.push({
        'Kode Akun': '',
        'Nama Akun': 'Status',
        Saldo: isBalanced ? '✓ BALANCE' : '✗ TIDAK BALANCE',
      });

      return this.pdfService.generate({
        title,
        period: `Per ${this.formatDate(params.date)}`,
        data: pdfData,
        orientation: 'portrait',
      });
    } else {
      // For Excel, create structured sections
      const excelData: any[] = [];

      // Assets section
      excelData.push({
        'Kode Akun': 'ASET (ASSETS)',
        'Nama Akun': '',
        Saldo: '',
      });
      excelData.push(...assets);
      excelData.push({
        'Kode Akun': '',
        'Nama Akun': 'Total Aset',
        Saldo: this.formatKiloIDR(totalAssets),
      });
      excelData.push({ 'Kode Akun': '', 'Nama Akun': '', Saldo: '' });

      // Liabilities section
      excelData.push({
        'Kode Akun': 'KEWAJIBAN (LIABILITIES)',
        'Nama Akun': '',
        Saldo: '',
      });
      excelData.push(...liabilities);
      excelData.push({
        'Kode Akun': '',
        'Nama Akun': 'Total Kewajiban',
        Saldo: this.formatKiloIDR(totalLiabilities),
      });
      excelData.push({ 'Kode Akun': '', 'Nama Akun': '', Saldo: '' });

      // Equity section
      excelData.push({
        'Kode Akun': 'EKUITAS (EQUITY)',
        'Nama Akun': '',
        Saldo: '',
      });
      excelData.push(...equity);
      excelData.push({
        'Kode Akun': '',
        'Nama Akun': 'Total Ekuitas',
        Saldo: this.formatKiloIDR(totalEquity),
      });
      excelData.push({ 'Kode Akun': '', 'Nama Akun': '', Saldo: '' });

      // Balance Check Section
      excelData.push({
        'Kode Akun': '═══════════════════════════════════',
        'Nama Akun': '',
        Saldo: '',
      });
      excelData.push({
        'Kode Akun': 'VERIFIKASI NERACA',
        'Nama Akun': '',
        Saldo: '',
      });
      excelData.push({
        'Kode Akun': '',
        'Nama Akun': 'Total Aset (Aktiva)',
        Saldo: this.formatKiloIDR(totalAssets),
      });
      excelData.push({
        'Kode Akun': '',
        'Nama Akun': 'Total Pasiva (Kewajiban + Ekuitas)',
        Saldo: this.formatKiloIDR(totalPassiva),
      });
      excelData.push({
        'Kode Akun': '',
        'Nama Akun': 'Selisih',
        Saldo: this.formatKiloIDR(balanceDifference),
      });
      excelData.push({
        'Kode Akun': '',
        'Nama Akun': 'Status',
        Saldo: isBalanced ? '✓ BALANCE' : '✗ TIDAK BALANCE',
      });

      return this.excelService.generate({
        title,
        period: `Per ${this.formatDate(params.date)}`,
        columns: ['Kode Akun', 'Nama Akun', 'Saldo'],
        data: excelData,
      });
    }
  }

  async generateLabaRugi(params: {
    startDate: Date;
    endDate: Date;
    format: 'PDF' | 'EXCEL';
    businessUnitId?: number;
  }) {
    const title = params.businessUnitId
      ? `LAPORAN LABA RUGI UNIT KERJA ${params.businessUnitId}`
      : 'LAPORAN LABA RUGI KONSOLIDASI';

    // Get journal details for the period
    const journalDetails = await this.prisma.postedJournalDetail.findMany({
      where: {
        journal: {
          journalDate: { gte: params.startDate, lte: params.endDate },
          status: 'POSTED',
        },
        ...(params.businessUnitId && {
          account: {
            businessUnitId: params.businessUnitId,
          },
        }),
      },
      include: {
        account: true,
      },
    });

    // Aggregate by account
    const accountBalances = new Map<
      string,
      {
        accountCode: string;
        accountName: string;
        accountType: string;
        balance: number;
      }
    >();

    journalDetails.forEach((detail) => {
      const key = detail.accountCode;
      if (!accountBalances.has(key)) {
        accountBalances.set(key, {
          accountCode: detail.account.accountCode,
          accountName: detail.account.accountName,
          accountType: detail.account.accountType,
          balance: 0,
        });
      }

      const acc = accountBalances.get(key)!;
      // For P&L: Revenue is credit normal, Expense is debit normal
      if (detail.account.accountType === 'REV') {
        acc.balance += Number(detail.credit) - Number(detail.debit);
      } else if (detail.account.accountType === 'EXP') {
        acc.balance += Number(detail.debit) - Number(detail.credit);
      }
    });

    // Separate revenue and expenses
    const revenues: any[] = [];
    const expenses: any[] = [];

    let totalRevenue = 0;
    let totalExpense = 0;

    accountBalances.forEach((acc) => {
      const item = {
        'Kode Akun': acc.accountCode,
        'Nama Akun': acc.accountName,
        Jumlah: this.formatKiloIDR(Math.abs(acc.balance)),
      };

      if (acc.accountType === 'REV') {
        revenues.push(item);
        totalRevenue += acc.balance;
      } else if (acc.accountType === 'EXP') {
        expenses.push(item);
        totalExpense += acc.balance;
      }
    });

    const netIncome = totalRevenue - totalExpense;

    // Format data
    const formattedData: any[] = [];

    // Revenue section
    formattedData.push({
      'Kode Akun': 'PENDAPATAN (REVENUE)',
      'Nama Akun': '',
      Jumlah: '',
    });
    formattedData.push(...revenues);
    formattedData.push({
      'Kode Akun': '',
      'Nama Akun': 'Total Pendapatan',
      Jumlah: this.formatKiloIDR(totalRevenue),
    });
    formattedData.push({ 'Kode Akun': '', 'Nama Akun': '', Jumlah: '' });

    // Expense section
    formattedData.push({
      'Kode Akun': 'BEBAN (EXPENSES)',
      'Nama Akun': '',
      Jumlah: '',
    });
    formattedData.push(...expenses);
    formattedData.push({
      'Kode Akun': '',
      'Nama Akun': 'Total Beban',
      Jumlah: this.formatKiloIDR(totalExpense),
    });
    formattedData.push({ 'Kode Akun': '', 'Nama Akun': '', Jumlah: '' });

    // Net income
    formattedData.push({
      'Kode Akun': '',
      'Nama Akun': 'LABA (RUGI) BERSIH',
      Jumlah: this.formatKiloIDR(netIncome),
    });

    if (params.format === 'PDF') {
      return this.pdfService.generate({
        title,
        period: `${this.formatDate(params.startDate)} s/d ${this.formatDate(params.endDate)}`,
        data: formattedData,
        orientation: 'portrait',
      });
    } else {
      return this.excelService.generate({
        title,
        period: `${this.formatDate(params.startDate)} s/d ${this.formatDate(params.endDate)}`,
        columns: ['Kode Akun', 'Nama Akun', 'Jumlah'],
        data: formattedData,
      });
    }
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  private formatKiloIDR(value: number): string {
    // Data stored in thousands (redenominated), multiply by 1000 to get actual Rupiah
    return this.formatCurrency(value * 1000);
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('id-ID').format(date);
  }
}
