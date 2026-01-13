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
exports.LaporanService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const pdf_service_1 = require("./pdf.service");
const excel_service_1 = require("./excel.service");
let LaporanService = class LaporanService {
    prisma;
    pdfService;
    excelService;
    constructor(prisma, pdfService, excelService) {
        this.prisma = prisma;
        this.pdfService = pdfService;
        this.excelService = excelService;
    }
    async generateSimpananRekap(params) {
        const data = await this.prisma.anggotaAccount.groupBy({
            by: ['regionCode'],
            where: {
                openDate: {
                    gte: params.startDate,
                    lte: params.endDate
                },
                ...(params.regionCode && { regionCode: params.regionCode })
            },
            _sum: {
                balance: true,
                principal: true,
                mandatoryInit: true
            },
            _count: {
                accountNumber: true
            }
        });
        const formattedData = data.map(item => ({
            'Kode Wilayah': item.regionCode || 'PUSAT',
            'Jumlah Rekening': item._count.accountNumber,
            'Total Pokok': this.formatCurrency(Number(item._sum.principal)),
            'Total Wajib': this.formatCurrency(Number(item._sum.mandatoryInit)),
            'Total Saldo': this.formatCurrency(Number(item._sum.balance))
        }));
        const totals = {
            'Total Rekening': data.reduce((sum, item) => sum + item._count.accountNumber, 0),
            'Sum Pokok': data.reduce((sum, item) => sum + Number(item._sum.principal), 0),
            'Sum Wajib': data.reduce((sum, item) => sum + Number(item._sum.mandatoryInit), 0),
            'Sum Saldo': data.reduce((sum, item) => sum + Number(item._sum.balance), 0)
        };
        if (params.format === 'PDF') {
            return this.pdfService.generate({
                title: 'REKAP SIMPANAN ANGGOTA',
                period: `${this.formatDate(params.startDate)} s/d ${this.formatDate(params.endDate)}`,
                data: formattedData,
                totals
            });
        }
        else {
            return this.excelService.generate({
                title: 'REKAP SIMPANAN ANGGOTA',
                period: `${this.formatDate(params.startDate)} s/d ${this.formatDate(params.endDate)}`,
                columns: ['Kode Wilayah', 'Jumlah Rekening', 'Total Pokok', 'Total Wajib', 'Total Saldo'],
                data: formattedData,
                totals
            });
        }
    }
    async generateTabrelaRekap(params) {
        return this.generateGenericProductRekap('NasabahTab', 'REKAP TABUNGAN SUKARELA (TABRELA)', params);
    }
    async generateBrahmacariRekap(params) {
        return this.generateGenericProductRekap('NasabahBrahmacari', 'REKAP BRAHMACARI', params);
    }
    async generateBalimesariRekap(params) {
        return this.generateGenericProductRekap('NasabahBalimesari', 'REKAP BALIMESARI', params);
    }
    async generateWanaprastaRekap(params) {
        return this.generateGenericProductRekap('NasabahWanaprasta', 'REKAP WANAPRASTA', params);
    }
    async generateDepositoRekap(params) {
        return this.generateGenericProductRekap('NasabahJangka', 'REKAP DEPOSITO', params, 'nominal');
    }
    async generateGenericProductRekap(modelName, title, params, balanceField = 'saldo') {
        const delegate = this.prisma[modelName.charAt(0).toLowerCase() + modelName.slice(1)];
        const data = await delegate.groupBy({
            by: ['status'],
            where: {
                tglBuka: {
                    lte: params.endDate
                }
            },
            _sum: {
                [balanceField]: true
            },
            _count: {
                [modelName === 'NasabahTab' ? 'noTab' : (modelName === 'NasabahJangka' ? 'noJangka' : `no${modelName.replace('Nasabah', '')}`)]: true
            }
        });
        const formattedData = data.map((item) => ({
            'Status': item.status === 'A' ? 'AKTIF' : 'TUTUP',
            'Jumlah Rekening': Object.values(item._count)[0],
            'Total Saldo': this.formatCurrency(Number(item._sum[balanceField] || 0))
        }));
        const totals = {
            'Total Rekening': data.reduce((sum, item) => sum + Number(Object.values(item._count)[0]), 0),
            'Sum Saldo': data.reduce((sum, item) => sum + Number(item._sum[balanceField] || 0), 0)
        };
        if (params.format === 'PDF') {
            return this.pdfService.generate({
                title,
                period: `${this.formatDate(params.startDate)} s/d ${this.formatDate(params.endDate)}`,
                data: formattedData,
                totals
            });
        }
        else {
            return this.excelService.generate({
                title,
                period: `${this.formatDate(params.startDate)} s/d ${this.formatDate(params.endDate)}`,
                columns: ['Status', 'Jumlah Rekening', 'Total Saldo'],
                data: formattedData,
                totals
            });
        }
    }
    async generateMutasiSimpanan(params) {
        let data = [];
        let title = '';
        switch (params.productType) {
            case 'ANGGOTA':
                title = 'MUTASI SIMPANAN ANGGOTA';
                data = await this.prisma.anggotaTransaction.findMany({
                    where: {
                        transDate: { gte: params.startDate, lte: params.endDate }
                    },
                    include: { account: { include: { customer: true } } },
                    orderBy: { transDate: 'asc' }
                });
                break;
            case 'TABRELA':
                title = 'MUTASI TABUNGAN SUKARELA';
                data = await this.prisma.transTab.findMany({
                    where: {
                        createdAt: { gte: params.startDate, lte: params.endDate }
                    },
                    include: { tabungan: { include: { nasabah: true } } },
                    orderBy: { createdAt: 'asc' }
                });
                break;
            case 'BRAHMACARI':
                title = 'MUTASI BRAHMACARI';
                data = await this.prisma.transBrahmacari.findMany({
                    where: {
                        createdAt: { gte: params.startDate, lte: params.endDate }
                    },
                    include: { brahmacari: { include: { nasabah: true } } },
                    orderBy: { createdAt: 'asc' }
                });
                break;
            case 'BALIMESARI':
                title = 'MUTASI BALIMESARI';
                data = await this.prisma.transBalimesari.findMany({
                    where: {
                        createdAt: { gte: params.startDate, lte: params.endDate }
                    },
                    include: { balimesari: { include: { nasabah: true } } },
                    orderBy: { createdAt: 'asc' }
                });
                break;
            case 'WANAPRASTA':
                title = 'MUTASI WANAPRASTA';
                data = await this.prisma.transWanaprasta.findMany({
                    where: {
                        createdAt: { gte: params.startDate, lte: params.endDate }
                    },
                    include: { wanaprasta: { include: { nasabah: true } } },
                    orderBy: { createdAt: 'asc' }
                });
                break;
            case 'DEPOSITO':
                title = 'MUTASI DEPOSITO';
                data = await this.prisma.transJangka.findMany({
                    where: {
                        createdAt: { gte: params.startDate, lte: params.endDate }
                    },
                    include: { deposito: { include: { nasabah: true } } },
                    orderBy: { createdAt: 'asc' }
                });
                break;
            default:
                throw new Error('Invalid product type');
        }
        const formattedData = data.map((item) => {
            const date = item.transDate || item.createdAt;
            const accountNo = item.accountNumber || item.noTab || item.noBrahmacari || item.noBalimesari || item.noWanaprasta || item.noJangka;
            const name = item.account?.customer?.nama || item.tabungan?.nasabah?.nama || item.brahmacari?.nasabah?.nama ||
                item.balimesari?.nasabah?.nama || item.wanaprasta?.nasabah?.nama || item.deposito?.nasabah?.nama || 'N/A';
            const type = item.transType || item.tipeTrans;
            const nominal = Number(item.amount || item.nominal || 0);
            return {
                'Tanggal': this.formatDate(date),
                'No. Rekening': accountNo,
                'Nama Nasabah': name,
                'Tipe Transaksi': type,
                'Keterangan': item.description || item.keterangan || '-',
                'Nominal': this.formatCurrency(nominal)
            };
        });
        if (params.format === 'PDF') {
            return this.pdfService.generate({
                title,
                period: `${this.formatDate(params.startDate)} s/d ${this.formatDate(params.endDate)}`,
                data: formattedData,
                orientation: 'landscape'
            });
        }
        else {
            return this.excelService.generate({
                title,
                period: `${this.formatDate(params.startDate)} s/d ${this.formatDate(params.endDate)}`,
                columns: ['Tanggal', 'No. Rekening', 'Nama Nasabah', 'Tipe Transaksi', 'Keterangan', 'Nominal'],
                data: formattedData
            });
        }
    }
    async generateDaftarRekening(params) {
        let data = [];
        let title = '';
        switch (params.productType) {
            case 'ANGGOTA':
                title = 'DAFTAR REKENING SIMPANAN ANGGOTA';
                data = await this.prisma.anggotaAccount.findMany({
                    where: { isActive: true },
                    include: { customer: true },
                    orderBy: { accountNumber: 'asc' }
                });
                break;
            case 'TABRELA':
                title = 'DAFTAR REKENING TABUNGAN SUKARELA';
                data = await this.prisma.nasabahTab.findMany({
                    where: { status: 'A' },
                    include: { nasabah: true },
                    orderBy: { noTab: 'asc' }
                });
                break;
            case 'BRAHMACARI':
                title = 'DAFTAR REKENING BRAHMACARI';
                data = await this.prisma.nasabahBrahmacari.findMany({
                    where: { status: 'A' },
                    include: { nasabah: true },
                    orderBy: { noBrahmacari: 'asc' }
                });
                break;
            case 'BALIMESARI':
                title = 'DAFTAR REKENING BALIMESARI';
                data = await this.prisma.nasabahBalimesari.findMany({
                    where: { status: 'A' },
                    include: { nasabah: true },
                    orderBy: { noBalimesari: 'asc' }
                });
                break;
            case 'WANAPRASTA':
                title = 'DAFTAR REKENING WANAPRASTA';
                data = await this.prisma.nasabahWanaprasta.findMany({
                    where: { status: 'A' },
                    include: { nasabah: true },
                    orderBy: { noWanaprasta: 'asc' }
                });
                break;
            case 'DEPOSITO':
                title = 'DAFTAR REKENING DEPOSITO';
                data = await this.prisma.nasabahJangka.findMany({
                    where: { status: 'A' },
                    include: { nasabah: true },
                    orderBy: { noJangka: 'asc' }
                });
                break;
            default:
                throw new Error('Invalid product type');
        }
        const formattedData = data.map((item) => {
            const accountNo = item.accountNumber || item.noTab || item.noBrahmacari ||
                item.noBalimesari || item.noWanaprasta || item.noJangka;
            const customerName = item.customer?.nama || item.nasabah?.nama || 'N/A';
            const openDate = item.openDate || item.tglBuka;
            const balance = item.balance || item.saldo || item.nominal || 0;
            const status = item.status === 'A' || item.isActive ? 'AKTIF' : 'TUTUP';
            return {
                'No. Rekening': accountNo,
                'Nama Nasabah': customerName,
                'Tanggal Buka': this.formatDate(openDate),
                'Saldo': this.formatCurrency(Number(balance)),
                'Status': status
            };
        });
        if (params.format === 'PDF') {
            return this.pdfService.generate({
                title,
                period: `Per ${this.formatDate(new Date())}`,
                data: formattedData,
                orientation: 'landscape'
            });
        }
        else {
            return this.excelService.generate({
                title,
                period: `Per ${this.formatDate(new Date())}`,
                columns: ['No. Rekening', 'Nama Nasabah', 'Tanggal Buka', 'Saldo', 'Status'],
                data: formattedData
            });
        }
    }
    async generateNeraca(params) {
        const title = params.businessUnitId ? `NERACA UNIT KERJA ${params.businessUnitId}` : 'NERACA KONSOLIDASI';
        const journalDetails = await this.prisma.postedJournalDetail.findMany({
            where: {
                journal: {
                    journalDate: { lte: params.date },
                    status: 'POSTED'
                },
                ...(params.businessUnitId && {
                    account: {
                        businessUnitId: params.businessUnitId
                    }
                })
            },
            include: {
                account: true
            }
        });
        const accountBalances = new Map();
        journalDetails.forEach(detail => {
            const key = detail.accountCode;
            if (!accountBalances.has(key)) {
                accountBalances.set(key, {
                    accountCode: detail.account.accountCode,
                    accountName: detail.account.accountName,
                    accountType: detail.account.accountType,
                    debit: 0,
                    credit: 0,
                    balance: 0
                });
            }
            const acc = accountBalances.get(key);
            acc.debit += Number(detail.debit);
            acc.credit += Number(detail.credit);
            if (detail.account.debetPoleFlag) {
                acc.balance = acc.debit - acc.credit;
            }
            else {
                acc.balance = acc.credit - acc.debit;
            }
        });
        const assets = [];
        const liabilities = [];
        const equity = [];
        let totalAssets = 0;
        let totalLiabilities = 0;
        let totalEquity = 0;
        accountBalances.forEach(acc => {
            const item = {
                'Kode Akun': acc.accountCode,
                'Nama Akun': acc.accountName,
                'Saldo': this.formatCurrency(acc.balance)
            };
            if (acc.accountType === 'AST') {
                assets.push(item);
                totalAssets += acc.balance;
            }
            else if (acc.accountType === 'LIA') {
                liabilities.push(item);
                totalLiabilities += acc.balance;
            }
            else if (acc.accountType === 'EQT') {
                equity.push(item);
                totalEquity += acc.balance;
            }
        });
        const formattedData = [
            { section: 'ASET (ASSETS)', data: assets, total: totalAssets },
            { section: 'KEWAJIBAN (LIABILITIES)', data: liabilities, total: totalLiabilities },
            { section: 'EKUITAS (EQUITY)', data: equity, total: totalEquity }
        ];
        const totalPassiva = totalLiabilities + totalEquity;
        const balanceDifference = totalAssets - totalPassiva;
        const isBalanced = Math.abs(balanceDifference) < 0.01;
        if (params.format === 'PDF') {
            const pdfData = [];
            pdfData.push({ 'Kode Akun': 'ASET (ASSETS)', 'Nama Akun': '', 'Saldo': '' });
            pdfData.push(...assets);
            pdfData.push({
                'Kode Akun': '',
                'Nama Akun': 'Total Aset',
                'Saldo': this.formatCurrency(totalAssets)
            });
            pdfData.push({ 'Kode Akun': '', 'Nama Akun': '', 'Saldo': '' });
            pdfData.push({ 'Kode Akun': 'KEWAJIBAN (LIABILITIES)', 'Nama Akun': '', 'Saldo': '' });
            pdfData.push(...liabilities);
            pdfData.push({
                'Kode Akun': '',
                'Nama Akun': 'Total Kewajiban',
                'Saldo': this.formatCurrency(totalLiabilities)
            });
            pdfData.push({ 'Kode Akun': '', 'Nama Akun': '', 'Saldo': '' });
            pdfData.push({ 'Kode Akun': 'EKUITAS (EQUITY)', 'Nama Akun': '', 'Saldo': '' });
            pdfData.push(...equity);
            pdfData.push({
                'Kode Akun': '',
                'Nama Akun': 'Total Ekuitas',
                'Saldo': this.formatCurrency(totalEquity)
            });
            pdfData.push({ 'Kode Akun': '', 'Nama Akun': '', 'Saldo': '' });
            pdfData.push({ 'Kode Akun': '═══════════════════════════════════', 'Nama Akun': '', 'Saldo': '' });
            pdfData.push({ 'Kode Akun': 'VERIFIKASI NERACA', 'Nama Akun': '', 'Saldo': '' });
            pdfData.push({ 'Kode Akun': '', 'Nama Akun': 'Total Aset (Aktiva)', 'Saldo': this.formatCurrency(totalAssets) });
            pdfData.push({ 'Kode Akun': '', 'Nama Akun': 'Total Pasiva (Kewajiban + Ekuitas)', 'Saldo': this.formatCurrency(totalPassiva) });
            pdfData.push({ 'Kode Akun': '', 'Nama Akun': 'Selisih', 'Saldo': this.formatCurrency(balanceDifference) });
            pdfData.push({
                'Kode Akun': '',
                'Nama Akun': 'Status',
                'Saldo': isBalanced ? '✓ BALANCE' : '✗ TIDAK BALANCE'
            });
            return this.pdfService.generate({
                title,
                period: `Per ${this.formatDate(params.date)}`,
                data: pdfData,
                orientation: 'portrait'
            });
        }
        else {
            const excelData = [];
            excelData.push({ 'Kode Akun': 'ASET (ASSETS)', 'Nama Akun': '', 'Saldo': '' });
            excelData.push(...assets);
            excelData.push({
                'Kode Akun': '',
                'Nama Akun': 'Total Aset',
                'Saldo': this.formatCurrency(totalAssets)
            });
            excelData.push({ 'Kode Akun': '', 'Nama Akun': '', 'Saldo': '' });
            excelData.push({ 'Kode Akun': 'KEWAJIBAN (LIABILITIES)', 'Nama Akun': '', 'Saldo': '' });
            excelData.push(...liabilities);
            excelData.push({
                'Kode Akun': '',
                'Nama Akun': 'Total Kewajiban',
                'Saldo': this.formatCurrency(totalLiabilities)
            });
            excelData.push({ 'Kode Akun': '', 'Nama Akun': '', 'Saldo': '' });
            excelData.push({ 'Kode Akun': 'EKUITAS (EQUITY)', 'Nama Akun': '', 'Saldo': '' });
            excelData.push(...equity);
            excelData.push({
                'Kode Akun': '',
                'Nama Akun': 'Total Ekuitas',
                'Saldo': this.formatCurrency(totalEquity)
            });
            excelData.push({ 'Kode Akun': '', 'Nama Akun': '', 'Saldo': '' });
            excelData.push({ 'Kode Akun': '═══════════════════════════════════', 'Nama Akun': '', 'Saldo': '' });
            excelData.push({ 'Kode Akun': 'VERIFIKASI NERACA', 'Nama Akun': '', 'Saldo': '' });
            excelData.push({ 'Kode Akun': '', 'Nama Akun': 'Total Aset (Aktiva)', 'Saldo': this.formatCurrency(totalAssets) });
            excelData.push({ 'Kode Akun': '', 'Nama Akun': 'Total Pasiva (Kewajiban + Ekuitas)', 'Saldo': this.formatCurrency(totalPassiva) });
            excelData.push({ 'Kode Akun': '', 'Nama Akun': 'Selisih', 'Saldo': this.formatCurrency(balanceDifference) });
            excelData.push({
                'Kode Akun': '',
                'Nama Akun': 'Status',
                'Saldo': isBalanced ? '✓ BALANCE' : '✗ TIDAK BALANCE'
            });
            return this.excelService.generate({
                title,
                period: `Per ${this.formatDate(params.date)}`,
                columns: ['Kode Akun', 'Nama Akun', 'Saldo'],
                data: excelData
            });
        }
    }
    async generateLabaRugi(params) {
        const title = params.businessUnitId ? `LAPORAN LABA RUGI UNIT KERJA ${params.businessUnitId}` : 'LAPORAN LABA RUGI KONSOLIDASI';
        const journalDetails = await this.prisma.postedJournalDetail.findMany({
            where: {
                journal: {
                    journalDate: { gte: params.startDate, lte: params.endDate },
                    status: 'POSTED'
                },
                ...(params.businessUnitId && {
                    account: {
                        businessUnitId: params.businessUnitId
                    }
                })
            },
            include: {
                account: true
            }
        });
        const accountBalances = new Map();
        journalDetails.forEach(detail => {
            const key = detail.accountCode;
            if (!accountBalances.has(key)) {
                accountBalances.set(key, {
                    accountCode: detail.account.accountCode,
                    accountName: detail.account.accountName,
                    accountType: detail.account.accountType,
                    balance: 0
                });
            }
            const acc = accountBalances.get(key);
            if (detail.account.accountType === 'REV') {
                acc.balance += Number(detail.credit) - Number(detail.debit);
            }
            else if (detail.account.accountType === 'EXP') {
                acc.balance += Number(detail.debit) - Number(detail.credit);
            }
        });
        const revenues = [];
        const expenses = [];
        let totalRevenue = 0;
        let totalExpense = 0;
        accountBalances.forEach(acc => {
            const item = {
                'Kode Akun': acc.accountCode,
                'Nama Akun': acc.accountName,
                'Jumlah': this.formatCurrency(Math.abs(acc.balance))
            };
            if (acc.accountType === 'REV') {
                revenues.push(item);
                totalRevenue += acc.balance;
            }
            else if (acc.accountType === 'EXP') {
                expenses.push(item);
                totalExpense += acc.balance;
            }
        });
        const netIncome = totalRevenue - totalExpense;
        const formattedData = [];
        formattedData.push({ 'Kode Akun': 'PENDAPATAN (REVENUE)', 'Nama Akun': '', 'Jumlah': '' });
        formattedData.push(...revenues);
        formattedData.push({
            'Kode Akun': '',
            'Nama Akun': 'Total Pendapatan',
            'Jumlah': this.formatCurrency(totalRevenue)
        });
        formattedData.push({ 'Kode Akun': '', 'Nama Akun': '', 'Jumlah': '' });
        formattedData.push({ 'Kode Akun': 'BEBAN (EXPENSES)', 'Nama Akun': '', 'Jumlah': '' });
        formattedData.push(...expenses);
        formattedData.push({
            'Kode Akun': '',
            'Nama Akun': 'Total Beban',
            'Jumlah': this.formatCurrency(totalExpense)
        });
        formattedData.push({ 'Kode Akun': '', 'Nama Akun': '', 'Jumlah': '' });
        formattedData.push({
            'Kode Akun': '',
            'Nama Akun': 'LABA (RUGI) BERSIH',
            'Jumlah': this.formatCurrency(netIncome)
        });
        if (params.format === 'PDF') {
            return this.pdfService.generate({
                title,
                period: `${this.formatDate(params.startDate)} s/d ${this.formatDate(params.endDate)}`,
                data: formattedData,
                orientation: 'portrait'
            });
        }
        else {
            return this.excelService.generate({
                title,
                period: `${this.formatDate(params.startDate)} s/d ${this.formatDate(params.endDate)}`,
                columns: ['Kode Akun', 'Nama Akun', 'Jumlah'],
                data: formattedData
            });
        }
    }
    formatCurrency(value) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(value);
    }
    formatDate(date) {
        return new Intl.DateTimeFormat('id-ID').format(date);
    }
};
exports.LaporanService = LaporanService;
exports.LaporanService = LaporanService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pdf_service_1.PdfService,
        excel_service_1.ExcelService])
], LaporanService);
//# sourceMappingURL=laporan.service.js.map