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
exports.AccountingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const core_1 = require("@nestjs/core");
const brahmacari_service_1 = require("../simpanan/brahmacari/brahmacari.service");
const anggota_service_1 = require("../simpanan/anggota/anggota.service");
const tabrela_service_1 = require("../simpanan/tabrela/tabrela.service");
const deposito_service_1 = require("../simpanan/deposito/deposito.service");
const balimesari_service_1 = require("../simpanan/balimesari/balimesari.service");
const wanaprasta_service_1 = require("../simpanan/wanaprasta/wanaprasta.service");
const period_lock_service_1 = require("../month-end/period-lock.service");
let AccountingService = class AccountingService {
    prisma;
    moduleRef;
    anggotaService;
    tabrelaService;
    depositoService;
    brahmacariService;
    balimesariService;
    wanaprastaService;
    periodLockService;
    constructor(prisma, moduleRef, anggotaService, tabrelaService, depositoService, brahmacariService, balimesariService, wanaprastaService, periodLockService) {
        this.prisma = prisma;
        this.moduleRef = moduleRef;
        this.anggotaService = anggotaService;
        this.tabrelaService = tabrelaService;
        this.depositoService = depositoService;
        this.brahmacariService = brahmacariService;
        this.balimesariService = balimesariService;
        this.wanaprastaService = wanaprastaService;
        this.periodLockService = periodLockService;
    }
    async getAccounts(type, page = 1, limit = 10) {
        const where = { isActive: true };
        if (type) {
            where.accountType = type;
        }
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.journalAccount.findMany({
                where,
                orderBy: { accountCode: 'asc' },
                skip,
                take: limit,
            }),
            this.prisma.journalAccount.count({ where })
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }
    async getParentAccounts() {
        return this.prisma.journalAccount.findMany({
            where: {
                parentCode: null,
                isActive: true
            },
            orderBy: { accountCode: 'asc' }
        });
    }
    async generateNextCode(parentCode) {
        const parent = await this.prisma.journalAccount.findUnique({ where: { accountCode: parentCode } });
        if (!parent)
            throw new common_1.NotFoundException('Parent Account not found');
        const prefix = parentCode.substring(0, 5);
        const lastChild = await this.prisma.journalAccount.findFirst({
            where: {
                accountCode: {
                    startsWith: prefix,
                    not: parentCode
                },
                parentCode: parentCode
            },
            orderBy: { accountCode: 'desc' }
        });
        let nextSequence = 1;
        if (lastChild) {
            const parts = lastChild.accountCode.split('.');
            if (parts.length === 3) {
                nextSequence = parseInt(parts[2]) + 1;
            }
        }
        return `${prefix}${String(nextSequence).padStart(2, '0')}`;
    }
    async createAccount(data) {
        const existing = await this.prisma.journalAccount.findUnique({
            where: { accountCode: data.accountCode },
        });
        if (existing)
            throw new common_1.BadRequestException('Account Code already exists');
        return this.prisma.journalAccount.create({ data });
    }
    async updateAccount(code, data) {
        return this.prisma.journalAccount.update({
            where: { accountCode: code },
            data,
        });
    }
    async getMappings(module) {
        const where = {};
        if (module)
            where.module = module;
        return this.prisma.productCoaMapping.findMany({
            where,
            include: {
                debitRef: true,
                creditRef: true,
            },
            orderBy: { transType: 'asc' }
        });
    }
    async updateMapping(transType, debitAccount, creditAccount) {
        const debit = await this.prisma.journalAccount.findUnique({ where: { accountCode: debitAccount } });
        const credit = await this.prisma.journalAccount.findUnique({ where: { accountCode: creditAccount } });
        if (!debit || !credit)
            throw new common_1.BadRequestException('Invalid Debit or Credit Account Code');
        return this.prisma.productCoaMapping.update({
            where: { transType },
            data: {
                debitAccount,
                creditAccount
            }
        });
    }
    async generateJournalNumber(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const prefix = `JU/${year}/${month}`;
        const lastJournal = await this.prisma.postedJournal.findFirst({
            where: { journalNumber: { startsWith: prefix } },
            orderBy: { journalNumber: 'desc' },
        });
        let sequence = 1;
        if (lastJournal) {
            const parts = lastJournal.journalNumber.split('/');
            sequence = parseInt(parts[3]) + 1;
        }
        return `${prefix}/${String(sequence).padStart(4, '0')}`;
    }
    async validateJournalEntry(details) {
        let totalDebit = 0;
        let totalCredit = 0;
        for (const d of details) {
            totalDebit += Number(d.debit);
            totalCredit += Number(d.credit);
        }
        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            throw new common_1.BadRequestException(`Journal Unbalanced: Debit ${totalDebit} != Credit ${totalCredit}`);
        }
        return true;
    }
    async getJournals(params) {
        const where = {};
        if (params.startDate && params.endDate) {
            where.journalDate = {
                gte: params.startDate,
                lte: params.endDate,
            };
        }
        if (params.status) {
            where.status = params.status;
        }
        if (params.sourceCode) {
            where.sourceCode = params.sourceCode;
        }
        if (params.fromAccount || params.toAccount) {
            where.details = {
                some: {
                    accountCode: {
                        gte: params.fromAccount,
                        lte: params.toAccount
                    }
                }
            };
        }
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.postedJournal.findMany({
                where,
                include: {
                    user: { select: { fullName: true } }
                },
                orderBy: { journalNumber: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.postedJournal.count({ where })
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }
    async getJournalDetail(id) {
        const journal = await this.prisma.postedJournal.findUnique({
            where: { id },
            include: {
                details: {
                    include: { account: true }
                },
                user: { select: { fullName: true } }
            }
        });
        if (!journal)
            throw new common_1.NotFoundException('Journal not found');
        const period = journal.journalDate.toISOString().slice(0, 7);
        const isLocked = await this.periodLockService.isPeriodLocked(period);
        return { ...journal, isLocked };
    }
    async createManualJournal(data) {
        await this.validateJournalEntry(data.details);
        const journalNo = await this.generateJournalNumber(data.date);
        return this.prisma.postedJournal.create({
            data: {
                journalNumber: journalNo,
                journalDate: data.date,
                description: data.description,
                postingType: 'MANUAL',
                userId: data.userId,
                status: 'POSTED',
                details: {
                    create: data.details.map(d => ({
                        accountCode: d.accountCode,
                        debit: d.debit,
                        credit: d.credit,
                        description: d.description || data.description
                    }))
                }
            }
        });
    }
    async updateManualJournal(id, data) {
        const period = data.date.toISOString().slice(0, 7);
        const isLocked = await this.periodLockService.isPeriodLocked(period);
        if (isLocked) {
            throw new common_1.BadRequestException(`Periode ${period} sudah ditutup. Tidak dapat melakukan perubahan jurnal.`);
        }
        const existing = await this.prisma.postedJournal.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Journal not found');
        if (existing.postingType !== 'MANUAL')
            throw new common_1.BadRequestException('Only Manual Journals can be edited');
        const oldPeriod = existing.journalDate.toISOString().slice(0, 7);
        if (await this.periodLockService.isPeriodLocked(oldPeriod)) {
            throw new common_1.BadRequestException(`Jurnal tersimpan di periode tertutup (${oldPeriod}). Tidak dapat diedit.`);
        }
        await this.validateJournalEntry(data.details);
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.postedJournal.update({
                where: { id },
                data: {
                    journalDate: data.date,
                    description: data.description,
                    userId: data.userId,
                }
            });
            await tx.postedJournalDetail.deleteMany({
                where: { journalId: id }
            });
            await tx.postedJournalDetail.createMany({
                data: data.details.map(d => ({
                    journalId: id,
                    accountCode: d.accountCode,
                    debit: d.debit,
                    credit: d.credit,
                    description: d.description || data.description
                }))
            });
            return updated;
        });
    }
    async autoPostJournal(data, tx) {
        const prisma = tx || this.prisma;
        const mapping = await prisma.productCoaMapping.findUnique({
            where: { transType: data.transType }
        });
        if (!mapping) {
            throw new common_1.BadRequestException(`Konfigurasi Akuntansi (COA Mapping) tidak ditemukan untuk transaksi: ${data.transType}. Silakan hubungi Admin untuk menambahkan mapping.`);
        }
        const debitAccount = mapping.debitAccount;
        const creditAccount = mapping.creditAccount;
        let detailedDescription = data.description || mapping.description;
        if (data.refId) {
            try {
                const info = await this.getTransactionInfo(data.transType, data.refId);
                if (info) {
                    detailedDescription += ` [Acct: ${info.accountNo} | #${info.sequence}]`;
                }
            }
            catch (err) {
                console.warn(`[Accounting] Failed to fetch transaction info for description: ${err.message}`);
            }
        }
        const journalNo = await this.generateJournalNumber();
        return prisma.postedJournal.create({
            data: {
                journalNumber: journalNo,
                journalDate: new Date(),
                description: detailedDescription,
                postingType: 'AUTO',
                transType: data.transType,
                sourceCode: data.transType.split('_')[0],
                refId: data.refId,
                userId: data.userId,
                wilayahCd: data.wilayahCd,
                status: 'POSTED',
                details: {
                    create: [
                        {
                            accountCode: debitAccount,
                            debit: data.amount,
                            credit: 0,
                            description: detailedDescription
                        },
                        {
                            accountCode: creditAccount,
                            debit: 0,
                            credit: data.amount,
                            description: detailedDescription
                        }
                    ]
                }
            }
        });
    }
    async getTransactionInfo(transType, refId) {
        const source = transType.split('_')[0];
        let accountNo = '';
        let sequence = 0;
        try {
            switch (source) {
                case 'ANGGOTA':
                    const tAnggota = await this.prisma.anggotaTransaction.findUnique({ where: { id: refId } });
                    if (!tAnggota)
                        return null;
                    accountNo = tAnggota.accountNumber;
                    sequence = await this.prisma.anggotaTransaction.count({
                        where: { accountNumber: accountNo, id: { lte: refId } }
                    });
                    break;
                case 'TABRELA':
                    const tTab = await this.prisma.transTab.findUnique({ where: { id: refId } });
                    if (!tTab)
                        return null;
                    accountNo = tTab.noTab;
                    sequence = await this.prisma.transTab.count({
                        where: { noTab: accountNo, id: { lte: refId } }
                    });
                    break;
                case 'DEPOSITO':
                    const tDep = await this.prisma.transJangka.findUnique({ where: { id: refId } });
                    if (!tDep)
                        return null;
                    accountNo = tDep.noJangka;
                    sequence = await this.prisma.transJangka.count({
                        where: { noJangka: accountNo, id: { lte: refId } }
                    });
                    break;
                case 'BRAHMACARI':
                    const tBrah = await this.prisma.transBrahmacari.findUnique({ where: { id: refId } });
                    if (!tBrah)
                        return null;
                    accountNo = tBrah.noBrahmacari;
                    sequence = await this.prisma.transBrahmacari.count({
                        where: { noBrahmacari: accountNo, id: { lte: refId } }
                    });
                    break;
                case 'BALIMESARI':
                    const tBali = await this.prisma.transBalimesari.findUnique({ where: { id: refId } });
                    if (!tBali)
                        return null;
                    accountNo = tBali.noBalimesari;
                    sequence = await this.prisma.transBalimesari.count({
                        where: { noBalimesari: accountNo, id: { lte: refId } }
                    });
                    break;
                case 'WANAPRASTA':
                    const tWana = await this.prisma.transWanaprasta.findUnique({ where: { id: refId } });
                    if (!tWana)
                        return null;
                    accountNo = tWana.noWanaprasta;
                    sequence = await this.prisma.transWanaprasta.count({
                        where: { noWanaprasta: accountNo, id: { lte: refId } }
                    });
                    break;
                case 'MODAL':
                    const tModal = await this.prisma.transModal.findUnique({ where: { id: refId } });
                    if (!tModal)
                        return null;
                    accountNo = tModal.noRekModal;
                    sequence = await this.prisma.transModal.count({
                        where: { noRekModal: accountNo, id: { lte: refId } }
                    });
                    break;
                case 'LOAN':
                case 'PINJAMAN_LUAR':
                    const loan = await this.prisma.externalLoan.findUnique({ where: { id: refId } });
                    if (!loan)
                        return null;
                    accountNo = loan.contractNumber;
                    sequence = 1;
                    break;
                default:
                    return null;
            }
            return { accountNo, sequence };
        }
        catch (e) {
            console.error(`Error fetching transaction info for ${transType} #${refId}:`, e);
            return null;
        }
    }
    async deleteJournal(id, userId, reason) {
        console.log(`[Accounting] Deleting Journal ID: ${id} by User: ${userId}`);
        return this.prisma.$transaction(async (tx) => {
            const journal = await tx.postedJournal.findUnique({
                where: { id },
                include: { details: true }
            });
            if (!journal)
                throw new common_1.NotFoundException('Journal not found');
            const period = journal.journalDate.toISOString().slice(0, 7);
            const isLocked = await this.periodLockService.isPeriodLocked(period);
            if (isLocked) {
                throw new common_1.BadRequestException(`Periode ${period} sudah ditutup. Jurnal tidak dapat dihapus.`);
            }
            if (journal.postingType === 'AUTO' && journal.refId && journal.sourceCode) {
                try {
                    console.log(`[Accounting] Voiding source transaction: ${journal.sourceCode} #${journal.refId}`);
                    switch (journal.sourceCode) {
                        case 'ANGGOTA':
                            if (this.anggotaService)
                                await this.anggotaService.voidTransaction(journal.refId, tx);
                            break;
                        case 'TABRELA':
                            if (this.tabrelaService)
                                await this.tabrelaService.voidTransaction(journal.refId, tx);
                            break;
                        case 'DEPOSITO':
                            if (this.depositoService)
                                await this.depositoService.voidTransaction(journal.refId, tx);
                            break;
                        case 'BRAHMACARI':
                            if (this.brahmacariService)
                                await this.brahmacariService.voidTransaction(journal.refId, tx);
                            break;
                        case 'BALIMESARI':
                            if (this.balimesariService)
                                await this.balimesariService.voidTransaction(journal.refId, tx);
                            break;
                        case 'WANAPRASTA':
                            if (this.wanaprastaService)
                                await this.wanaprastaService.voidTransaction(journal.refId, tx);
                            break;
                        default:
                            console.warn(`[Accounting] No void handler for sourceCode: ${journal.sourceCode}`);
                    }
                }
                catch (error) {
                    console.error('[Accounting] Failed to void transaction during journal delete:', error);
                    throw new common_1.BadRequestException(`Failed to void source transaction: ${error.message}`);
                }
            }
            console.log('[Accounting] Archiving to PostedJournalTemp...');
            const temp = await tx.postedJournalTemp.create({
                data: {
                    originalId: journal.id,
                    journalNumber: journal.journalNumber,
                    journalDate: journal.journalDate,
                    description: journal.description,
                    postingType: journal.postingType,
                    transType: journal.transType || '',
                    sourceCode: journal.sourceCode,
                    refId: journal.refId,
                    userId: journal.userId,
                    wilayahCd: journal.wilayahCd,
                    status: 'DELETED',
                    deletedBy: userId.toString(),
                    deleteReason: reason
                }
            });
            if (journal.details.length > 0) {
                await tx.postedJournalDetailTemp.createMany({
                    data: journal.details.map(d => ({
                        tempJournalId: temp.id,
                        accountCode: d.accountCode,
                        debit: d.debit,
                        credit: d.credit,
                        description: d.description
                    }))
                });
            }
            console.log('[Accounting] Deleting original Journal...');
            await tx.postedJournalDetail.deleteMany({ where: { journalId: id } });
            await tx.postedJournal.delete({ where: { id } });
            console.log('[Accounting] Delete Complete.');
            return { success: true, message: 'Journal deleted and associated transactions voided.' };
        });
    }
    async getDeletedJournals(params) {
        const where = {};
        if (params.startDate && params.endDate) {
            where.deletedAt = {
                gte: params.startDate,
                lte: params.endDate,
            };
        }
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.postedJournalTemp.findMany({
                where,
                orderBy: { deletedAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.postedJournalTemp.count({ where })
        ]);
        const userIds = [...new Set(data.map(d => Number(d.deletedBy)).filter(id => !isNaN(id)))];
        const users = await this.prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, fullName: true, username: true }
        });
        const enrichedData = data.map(journal => {
            const deleterId = Number(journal.deletedBy);
            const deleter = users.find(u => u.id === deleterId);
            return {
                ...journal,
                deletedByName: deleter ? `${deleter.fullName} (${deleter.username})` : journal.deletedBy
            };
        });
        return {
            data: enrichedData,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }
    async getDailyReportData(date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        const journals = await this.prisma.postedJournal.findMany({
            where: {
                journalDate: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            include: { details: true }
        });
        const products = ['ANGGOTA', 'TABRELA', 'DEPOSITO', 'BRAHMACARI', 'BALIMESARI', 'WANAPRASTA', 'KREDIT'];
        const summaryMap = new Map();
        products.forEach(p => summaryMap.set(p, {
            product: p,
            depositTotal: 0,
            withdrawalTotal: 0,
            depositCount: 0,
            withdrawalCount: 0
        }));
        for (const j of journals) {
            if (!j.sourceCode || !summaryMap.has(j.sourceCode))
                continue;
            const stats = summaryMap.get(j.sourceCode);
            const type = j.transType || '';
            const amount = j.details.reduce((sum, d) => sum + Number(d.debit), 0);
            if (type.includes('SETOR') || type.includes('BUKA') || type.includes('TABUNG') || type.includes('ANGSURAN')) {
                stats.depositTotal += amount;
                stats.depositCount++;
            }
            else if (type.includes('TARIK') || type.includes('CAIR') || type.includes('TUTUP') || type.includes('REALISASI')) {
                stats.withdrawalTotal += amount;
                stats.withdrawalCount++;
            }
        }
        const summary = Array.from(summaryMap.values());
        const interestEstimates = [];
        const calcInterest = async (model, name) => {
            const agg = await model.aggregate({
                _sum: { saldo: true },
                _avg: { interestRate: true }
            });
            const totalSaldo = Number(agg._sum.saldo || 0);
            const avgRate = Number(agg._avg.interestRate || 0);
            const dailyInterest = (totalSaldo * (avgRate / 100)) / 365;
            return {
                product: name,
                totalBalance: totalSaldo,
                avgRate: avgRate,
                estimatedDailyInterest: dailyInterest
            };
        };
        if (this.prisma.nasabahTab)
            interestEstimates.push(await calcInterest(this.prisma.nasabahTab, 'TABRELA'));
        if (this.prisma.nasabahBrahmacari)
            interestEstimates.push(await calcInterest(this.prisma.nasabahBrahmacari, 'BRAHMACARI'));
        if (this.prisma.nasabahBalimesari)
            interestEstimates.push(await calcInterest(this.prisma.nasabahBalimesari, 'BALIMESARI'));
        if (this.prisma.nasabahWanaprasta)
            interestEstimates.push(await calcInterest(this.prisma.nasabahWanaprasta, 'WANAPRASTA'));
        if (this.prisma.nasabahJangka) {
            const agg = await this.prisma.nasabahJangka.aggregate({
                _sum: { nominal: true },
                _avg: { bunga: true }
            });
            const totalSaldo = Number(agg._sum.nominal || 0);
            const avgRate = Number(agg._avg.bunga || 0);
            const dailyInterest = (totalSaldo * (avgRate / 100)) / 365;
            interestEstimates.push({
                product: 'DEPOSITO',
                totalBalance: totalSaldo,
                avgRate: avgRate,
                estimatedDailyInterest: dailyInterest
            });
        }
        return {
            date: date,
            summary,
            interestEstimates,
            journals
        };
    }
};
exports.AccountingService = AccountingService;
exports.AccountingService = AccountingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        core_1.ModuleRef,
        anggota_service_1.AnggotaService,
        tabrela_service_1.TabrelaService,
        deposito_service_1.DepositoService,
        brahmacari_service_1.BrahmacariService,
        balimesari_service_1.BalimesariService,
        wanaprasta_service_1.WanaprastaService,
        period_lock_service_1.PeriodLockService])
], AccountingService);
//# sourceMappingURL=accounting.service.js.map