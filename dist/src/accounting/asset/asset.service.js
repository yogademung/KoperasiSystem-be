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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
const accounting_service_1 = require("../accounting.service");
const period_lock_service_1 = require("../../month-end/period-lock.service");
let AssetService = class AssetService {
    prisma;
    accountingService;
    periodLockService;
    constructor(prisma, accountingService, periodLockService) {
        this.prisma = prisma;
        this.accountingService = accountingService;
        this.periodLockService = periodLockService;
    }
    async create(createAssetDto, userId) {
        return await this.prisma.$transaction(async (tx) => {
            const acquisitionDate = new Date(createAssetDto.acquisitionDate);
            const period = `${acquisitionDate.getFullYear()}-${String(acquisitionDate.getMonth() + 1).padStart(2, '0')}`;
            const isLocked = await this.periodLockService.isPeriodLocked(period);
            if (isLocked) {
                throw new common_1.BadRequestException(`Periode ${period} sudah ditutup. Tidak dapat menambah aset baru pada periode ini.`);
            }
            let assetCode = createAssetDto.code;
            if (!assetCode || assetCode === 'AUTO') {
                assetCode = await this.generateAssetCode(createAssetDto.acquisitionDate, tx);
            }
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
            for (const acc of accountCodesToValidate) {
                const exists = await tx.journalAccount.findUnique({
                    where: { accountCode: acc.code },
                });
                if (!exists) {
                    throw new Error(`${acc.name} dengan kode '${acc.code}' tidak ditemukan di Chart of Accounts. Silakan periksa konfigurasi COA.`);
                }
            }
            const asset = await tx.asset.create({
                data: {
                    name: createAssetDto.name,
                    code: assetCode,
                    type: createAssetDto.type,
                    acquisitionDate: new Date(createAssetDto.acquisitionDate),
                    acquisitionCost: new client_1.Prisma.Decimal(createAssetDto.acquisitionCost),
                    residualValue: new client_1.Prisma.Decimal(createAssetDto.residualValue || 0),
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
    async findAll(page = 1, limit = 10) {
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
    async generateAssetCode(dateStr, tx) {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const codePrefix = `ASSET-${day}${month}${year}-`;
        const prisma = tx || this.prisma;
        const existingCount = await prisma.asset.count({
            where: {
                code: { startsWith: codePrefix },
            },
        });
        const sequence = String(existingCount + 1).padStart(3, '0');
        return `${codePrefix}${sequence}`;
    }
    async findOne(id) {
        const asset = await this.prisma.asset.findUnique({
            where: { id },
            include: {
                depreciationHistory: {
                    include: { journal: true },
                    orderBy: { period: 'desc' },
                },
            },
        });
        if (!asset)
            throw new common_1.NotFoundException('Asset not found');
        return asset;
    }
    async update(id, data) {
        const updateData = { ...data };
        if (data.acquisitionCost)
            updateData.acquisitionCost = new client_1.Prisma.Decimal(data.acquisitionCost);
        if (data.residualValue)
            updateData.residualValue = new client_1.Prisma.Decimal(data.residualValue);
        return this.prisma.asset.update({
            where: { id },
            data: updateData,
        });
    }
    async remove(id) {
        return this.prisma.asset.delete({ where: { id } });
    }
    async calculateMonthlyDepreciation(assetId, date) {
        const asset = await this.prisma.asset.findUnique({
            where: { id: assetId },
        });
        if (!asset)
            throw new common_1.NotFoundException('Asset not found');
        if (asset.depreciationMethod === 'STRAIGHT_LINE') {
            const amount = ((Number(asset.acquisitionCost) - Number(asset.residualValue)) *
                (asset.depreciationRate / 100)) /
                12;
            return amount;
        }
        return 0;
    }
    async runDepreciationProcess(userId, date) {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const period = `${year}-${month}`;
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
                throw new Error(`Akun '${accountCode}' tidak ditemukan di Chart of Accounts. Periksa konfigurasi aset sebelum menjalankan penyusutan.`);
            }
        }
        const results = [];
        let totalDepreciation = 0;
        const journalEntries = [];
        for (const asset of assets) {
            const existing = await this.prisma.assetDepreciationHistory.findFirst({
                where: { assetId: asset.id, period },
            });
            if (existing)
                continue;
            const amount = await this.calculateMonthlyDepreciation(asset.id, date);
            if (amount <= 0)
                continue;
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
        return this.prisma.$transaction(async (tx) => {
            const details = [];
            const groupedDetails = new Map();
            for (const entry of journalEntries) {
                const exp = groupedDetails.get(entry.expenseAccount) || {
                    debit: 0,
                    credit: 0,
                };
                groupedDetails.set(entry.expenseAccount, {
                    debit: exp.debit + entry.amount,
                    credit: exp.credit,
                });
                const acc = groupedDetails.get(entry.accumAccount) || {
                    debit: 0,
                    credit: 0,
                };
                groupedDetails.set(entry.accumAccount, {
                    debit: acc.debit,
                    credit: acc.credit + entry.amount,
                });
            }
            const finalDetails = Array.from(groupedDetails.entries()).map(([code, val]) => ({
                accountCode: code,
                debit: val.debit,
                credit: val.credit,
                description: `Penyusutan Aktiva - ${period}`,
            }));
            const manualData = {
                date: new Date(),
                description: `Penyusutan Aktiva Otomatis - Periode ${period}`,
                userId,
                details: finalDetails,
            };
            const journal = await this.accountingService.createManualJournal(manualData);
            await tx.postedJournal.update({
                where: { id: journal.id },
                data: { postingType: 'AUTO', sourceCode: 'ASSET' },
            });
            for (const res of results) {
                await tx.assetDepreciationHistory.create({
                    data: {
                        assetId: res.assetId,
                        period,
                        amount: new client_1.Prisma.Decimal(res.amount),
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
    async voidTransaction(assetId, tx) {
        return tx.asset.update({
            where: { id: assetId },
            data: { status: 'INACTIVE', updatedBy: 'SYSTEM_VOID' },
        });
    }
    async payAssetPurchase(dto) {
        return this.prisma.$transaction(async (tx) => {
            const asset = await tx.asset.findUnique({
                where: { id: dto.assetId },
            });
            if (!asset)
                throw new common_1.NotFoundException('Asset not found');
            const hutangAccount = '2.20.04';
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
                    postingType: 'MANUAL',
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
    async disposeAsset(dto) {
        return this.prisma.$transaction(async (tx) => {
            const asset = await tx.asset.findUnique({
                where: { id: dto.assetId },
            });
            if (!asset)
                throw new common_1.NotFoundException('Asset not found');
            if (asset.status !== 'ACTIVE')
                throw new common_1.BadRequestException('Asset is not ACTIVE');
            const history = await tx.assetDepreciationHistory.findMany({
                where: { assetId: asset.id },
            });
            const accumDepreciation = history.reduce((sum, h) => sum.plus(h.amount), new client_1.Prisma.Decimal(0));
            const acquisitionCost = new client_1.Prisma.Decimal(asset.acquisitionCost);
            const bookValue = acquisitionCost.minus(accumDepreciation);
            const saleAmount = new client_1.Prisma.Decimal(dto.saleAmount);
            const gainLoss = saleAmount.minus(bookValue);
            let gainLossAccount = dto.gainLossAccountId;
            if (!gainLossAccount) {
                if (gainLoss.greaterThan(0)) {
                    gainLossAccount = '4.20.04';
                }
                else {
                    gainLossAccount = '5.40.01';
                }
            }
            const checkAcc = await tx.journalAccount.findUnique({ where: { accountCode: gainLossAccount } });
            if (!checkAcc)
                throw new common_1.BadRequestException(`Gain/Loss Account ${gainLossAccount} not found`);
            const details = [];
            if (saleAmount.greaterThan(0)) {
                details.push({
                    accountCode: dto.paymentAccountId,
                    debit: saleAmount.toNumber(),
                    credit: 0,
                    description: `Penjualan Aset ${asset.name}`
                });
            }
            if (accumDepreciation.greaterThan(0)) {
                details.push({
                    accountCode: asset.accumDepreciationAccountId,
                    debit: accumDepreciation.toNumber(),
                    credit: 0,
                    description: `Hapus Akumulasi ${asset.name}`
                });
            }
            details.push({
                accountCode: asset.assetAccountId,
                debit: 0,
                credit: acquisitionCost.toNumber(),
                description: `Hapus Aset ${asset.name}`
            });
            if (gainLoss.greaterThan(0)) {
                details.push({
                    accountCode: gainLossAccount,
                    debit: 0,
                    credit: gainLoss.toNumber(),
                    description: `Keuntungan Penjualan Aset`
                });
            }
            else if (gainLoss.lessThan(0)) {
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
            await tx.asset.update({
                where: { id: asset.id },
                data: { status: 'DISPOSED', updatedBy: dto.userId.toString() }
            });
            return { journal, gainLoss: gainLoss.toNumber() };
        });
    }
    async getBalanceSheet(date) {
        const assets = await this.prisma.asset.findMany({
            where: {
                acquisitionDate: { lte: date },
                status: 'ACTIVE',
            },
        });
        const reportData = await Promise.all(assets.map(async (asset) => {
            const history = await this.prisma.assetDepreciationHistory.findMany({
                where: {
                    assetId: asset.id,
                    period: {
                        lte: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
                    },
                },
            });
            const totalDepreciation = history.reduce((sum, h) => sum.plus(h.amount), new client_1.Prisma.Decimal(0));
            const bookValue = new client_1.Prisma.Decimal(asset.acquisitionCost).minus(totalDepreciation);
            return {
                id: asset.id,
                code: asset.code,
                name: asset.name,
                type: asset.type,
                acquisitionCost: asset.acquisitionCost,
                accumulatedDepreciation: totalDepreciation,
                bookValue: bookValue,
            };
        }));
        return {
            date,
            totalAcquisition: reportData.reduce((sum, r) => sum.plus(r.acquisitionCost), new client_1.Prisma.Decimal(0)),
            totalBookValue: reportData.reduce((sum, r) => sum.plus(r.bookValue), new client_1.Prisma.Decimal(0)),
            details: reportData,
        };
    }
    async getAssetMutations(startDate, endDate) {
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
};
exports.AssetService = AssetService;
exports.AssetService = AssetService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => accounting_service_1.AccountingService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        accounting_service_1.AccountingService,
        period_lock_service_1.PeriodLockService])
], AssetService);
//# sourceMappingURL=asset.service.js.map