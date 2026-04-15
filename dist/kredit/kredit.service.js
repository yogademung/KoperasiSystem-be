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
exports.KreditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const client_1 = require("@prisma/client");
const accounting_service_1 = require("../accounting/accounting.service");
let KreditService = class KreditService {
    prisma;
    accountingService;
    constructor(prisma, accountingService) {
        this.prisma = prisma;
        this.accountingService = accountingService;
    }
    async createApplication(data, userId) {
        const noPermohonan = await this.generatePermohonanNumber();
        return this.prisma.debiturKredit.create({
            data: {
                nasabahId: data.nasabahId,
                noPermohonan,
                jenisKredit: data.jenisKredit,
                tujuanKredit: data.tujuanKredit,
                nominalPengajuan: new client_1.Prisma.Decimal(data.nominalPengajuan),
                mohonJangkaWaktu: data.mohonJangkaWaktu,
                mohonSukuBunga: new client_1.Prisma.Decimal(data.mohonSukuBunga),
                metodeAngsuran: data.metodeAngsuran,
                sistemBunga: data.sistemBunga,
                tglPengajuan: new Date(),
                status: 'OPEN',
                createdBy: userId.toString(),
            },
        });
    }
    async generatePermohonanNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const prefix = `PK/${year}/${month}`;
        const count = await this.prisma.debiturKredit.count({
            where: { noPermohonan: { startsWith: prefix } },
        });
        return `${prefix}/${String(count + 1).padStart(4, '0')}`;
    }
    async addCollateral(creditId, data, userId) {
        try {
            const nasabahId = parseInt(data.nasabahId);
            if (isNaN(nasabahId))
                throw new common_1.BadRequestException('Invalid Nasabah ID');
            const type = data.type;
            if (!type)
                throw new common_1.BadRequestException('Collateral type is required');
            const marketVal = parseFloat(data.marketValue || '0');
            const assessedVal = parseFloat(data.assessedValue || '0');
            if (isNaN(marketVal) || isNaN(assessedVal))
                throw new common_1.BadRequestException('Invalid market or assessed value');
            if (marketVal < 0 || assessedVal < 0)
                throw new common_1.BadRequestException('Values must be positive');
            let detailsObj = data.details;
            if (typeof detailsObj === 'string') {
                try {
                    detailsObj = JSON.parse(detailsObj);
                }
                catch (e) {
                    console.warn('Failed to parse details JSON string:', detailsObj);
                }
            }
            return await this.prisma.$transaction(async (tx) => {
                const collateral = await tx.collateral.create({
                    data: {
                        nasabahId: nasabahId,
                        type: type,
                        description: data.description || '',
                        marketValue: new client_1.Prisma.Decimal(marketVal),
                        assessedValue: new client_1.Prisma.Decimal(assessedVal),
                        details: detailsObj ? JSON.stringify(detailsObj) : null,
                        photos: data.photos || null,
                        status: 'ACTIVE',
                        createdBy: userId.toString(),
                    },
                });
                await tx.kreditCollateral.create({
                    data: {
                        creditId: creditId,
                        collateralId: collateral.id,
                    },
                });
                return collateral;
            });
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            console.error('Add Collateral Service Error:', error);
            throw new common_1.BadRequestException(`Failed to add collateral: ${error.message}`);
        }
    }
    async submitAnalysis(creditId, data, userId) {
        return this.prisma.$transaction(async (tx) => {
            const analysis = await tx.creditAnalysis.upsert({
                where: { debiturKreditId: creditId },
                update: {
                    characterScore: data.characterScore,
                    characterDesc: data.characterDesc,
                    capitalScore: data.capitalScore,
                    capitalDesc: data.capitalDesc,
                    capacityScore: data.capacityScore,
                    capacityDesc: data.capacityDesc,
                    conditionScore: data.conditionScore,
                    conditionDesc: data.conditionDesc,
                    collateralScore: data.collateralScore,
                    collateralDesc: data.collateralDesc,
                    totalScore: data.totalScore,
                    recommendation: data.recommendation,
                    updatedBy: userId.toString(),
                },
                create: {
                    debiturKreditId: creditId,
                    characterScore: data.characterScore,
                    characterDesc: data.characterDesc,
                    capitalScore: data.capitalScore,
                    capitalDesc: data.capitalDesc,
                    capacityScore: data.capacityScore,
                    capacityDesc: data.capacityDesc,
                    conditionScore: data.conditionScore,
                    conditionDesc: data.conditionDesc,
                    collateralScore: data.collateralScore,
                    collateralDesc: data.collateralDesc,
                    totalScore: data.totalScore,
                    recommendation: data.recommendation,
                    createdBy: userId.toString(),
                },
            });
            await tx.debiturKredit.update({
                where: { id: creditId },
                data: { status: 'ANALYZE' },
            });
            return analysis;
        });
    }
    async approveCredit(creditId, decision, userId) {
        return this.prisma.debiturKredit.update({
            where: { id: creditId },
            data: {
                status: decision.status,
                updatedBy: userId.toString(),
            },
        });
    }
    async activateCredit(creditId, data, userId) {
        const credit = await this.prisma.debiturKredit.findUnique({
            where: { id: creditId },
            include: { nasabah: true },
        });
        if (!credit || credit.status !== 'APPROVE') {
            throw new common_1.BadRequestException('Credit application is not approved or not found');
        }
        const nomorKredit = await this.generateSpkNumber();
        return this.prisma.$transaction(async (tx) => {
            try {
                await tx.debiturFasilitas.create({
                    data: {
                        debiturKreditId: creditId,
                        nominal: new client_1.Prisma.Decimal(data.plafond),
                        bunga: new client_1.Prisma.Decimal(data.bungaPct),
                        jangkaWaktu: data.jangkaWaktu,
                        angsuranPokok: new client_1.Prisma.Decimal(data.angsuranPokok),
                        angsuranBunga: new client_1.Prisma.Decimal(data.angsuranBunga),
                        createdBy: userId.toString(),
                    },
                });
                const realization = await tx.debiturRealisasi.create({
                    data: {
                        debiturKreditId: creditId,
                        tglRealisasi: new Date(),
                        nominalRealisasi: new client_1.Prisma.Decimal(data.plafond),
                        createdBy: userId.toString(),
                    },
                });
                const mapping = await tx.productCoaMapping.findUnique({
                    where: { transType: 'KREDIT_REALISASI' },
                });
                if (!mapping) {
                    throw new common_1.BadRequestException('Konfigurasi COA Mapping untuk [KREDIT_REALISASI] belum tersedia. Hubungi Administrator.');
                }
                const journalDetails = [
                    {
                        accountCode: mapping.debitAccount,
                        debit: Number(data.plafond),
                        credit: 0,
                        description: `Pencairan Kredit ${nomorKredit}`,
                    },
                    {
                        accountCode: mapping.creditAccount,
                        debit: 0,
                        credit: Number(data.plafond),
                        description: `Pencairan Kredit ${nomorKredit}`,
                    },
                ];
                const journalNo = await this.accountingService.generateJournalNumber(new Date());
                await tx.postedJournal.create({
                    data: {
                        journalNumber: journalNo,
                        journalDate: new Date(),
                        description: `Realisasi Kredit ${nomorKredit} - ${credit.nasabah.nama}`,
                        postingType: 'AUTO',
                        sourceCode: 'KREDIT',
                        refId: realization.id,
                        userId: userId,
                        status: 'POSTED',
                        transType: 'KREDIT_REALISASI',
                        details: {
                            create: journalDetails.map((d) => ({
                                accountCode: d.accountCode,
                                debit: d.debit,
                                credit: d.credit,
                                description: d.description,
                            })),
                        },
                    },
                });
                const schedule = this.calculateInstallmentSchedule(Number(data.plafond), Number(data.bungaPct), Number(data.jangkaWaktu), new Date());
                await tx.debiturJadwal.createMany({
                    data: schedule.map((s) => ({
                        debiturKreditId: creditId,
                        angsuranKe: s.angsuranKe,
                        tglJatuhTempo: s.tglJatuhTempo,
                        pokok: new client_1.Prisma.Decimal(s.pokok),
                        bunga: new client_1.Prisma.Decimal(s.bunga),
                        total: new client_1.Prisma.Decimal(s.total),
                        sisaPokok: new client_1.Prisma.Decimal(s.pokok),
                        sisaBunga: new client_1.Prisma.Decimal(s.bunga),
                        status: 'UNPAID',
                        createdBy: 'SYSTEM',
                    })),
                });
                return await tx.debiturKredit.update({
                    where: { id: creditId },
                    data: {
                        nomorKredit,
                        status: 'ACTIVE',
                        updatedBy: userId.toString(),
                    },
                });
            }
            catch (error) {
                console.error('Credit Activation Error:', error);
                if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                    if (error.code === 'P2003') {
                        throw new common_1.BadRequestException('Terjadi kesalahan data referensi (Akun Akuntansi tidak ditemukan). Harap periksa konfigurasi Chart of Account.');
                    }
                }
                if (error instanceof common_1.BadRequestException)
                    throw error;
                throw new common_1.BadRequestException(`Gagal merealisasikan kredit: ${error.message}`);
            }
        });
    }
    async payInstallment(creditId, data, userId) {
        const credit = await this.prisma.debiturKredit.findUnique({
            where: { id: creditId },
            include: { nasabah: true },
        });
        if (!credit || credit.status !== 'ACTIVE') {
            throw new common_1.BadRequestException('Credit is not ACTIVE or not found');
        }
        const paymentAmount = Number(data.amount);
        if (paymentAmount <= 0)
            throw new common_1.BadRequestException('Payment amount must be positive');
        const paymentDate = data.date ? new Date(data.date) : new Date();
        return this.prisma
            .$transaction(async (tx) => {
            const trans = await tx.transKredit.create({
                data: {
                    debiturKreditId: creditId,
                    tipeTrans: 'ANGSURAN',
                    tglTrans: paymentDate,
                    nominal: new client_1.Prisma.Decimal(paymentAmount),
                    keterangan: data.description || 'Pembayaran Angsuran Kredit',
                    createdBy: userId.toString(),
                },
            });
            const schedules = await tx.debiturJadwal.findMany({
                where: {
                    debiturKreditId: creditId,
                    status: { in: ['UNPAID', 'PARTIAL'] },
                },
                orderBy: { angsuranKe: 'asc' },
            });
            let remainingMoney = Number(paymentAmount);
            const journalDetailsData = [];
            const mapping = await tx.productCoaMapping.findUnique({
                where: { transType: 'KREDIT_ANGSURAN' },
            });
            const cashAccount = mapping?.debitAccount || '10100';
            const receivableAccount = mapping?.creditAccount || '10300';
            const interestMapping = await tx.productCoaMapping.findUnique({
                where: { transType: 'KREDIT_BUNGA' },
            });
            const interestIncomeAccount = interestMapping?.creditAccount || '40100';
            let totalPrincipalPaid = 0;
            let totalInterestPaid = 0;
            for (const sched of schedules) {
                if (remainingMoney <= 0)
                    break;
                let interestDue = Number(sched.sisaBunga);
                let principalDue = Number(sched.sisaPokok);
                if (interestDue === 0 && Number(sched.bunga) > 0) {
                    if (sched.status === 'UNPAID' ||
                        (sched.status === 'PARTIAL' &&
                            principalDue >= Number(sched.pokok) - 100)) {
                        interestDue = Number(sched.bunga);
                    }
                }
                let payInt = 0;
                if (interestDue > 0) {
                    payInt = Math.min(remainingMoney, interestDue);
                    interestDue -= payInt;
                    remainingMoney -= payInt;
                    totalInterestPaid += payInt;
                }
                let payPrin = 0;
                if (remainingMoney > 0 && principalDue > 0) {
                    payPrin = Math.min(remainingMoney, principalDue);
                    principalDue -= payPrin;
                    remainingMoney -= payPrin;
                    totalPrincipalPaid += payPrin;
                }
                if (payInt > 0 || payPrin > 0) {
                    let newStatus = 'PARTIAL';
                    if (interestDue <= 0.01 && principalDue <= 0.01) {
                        newStatus = 'PAID';
                    }
                    await tx.debiturJadwal.update({
                        where: { id: sched.id },
                        data: {
                            sisaBunga: new client_1.Prisma.Decimal(interestDue),
                            sisaPokok: new client_1.Prisma.Decimal(principalDue),
                            status: newStatus,
                            tglBayar: new Date(),
                            updatedBy: userId.toString(),
                        },
                    });
                }
            }
            let journalId = null;
            if (totalPrincipalPaid + totalInterestPaid > 0) {
                const journalNo = await this.accountingService.generateJournalNumber(paymentDate);
                const journalDetails = [
                    {
                        accountCode: cashAccount,
                        debit: totalPrincipalPaid + totalInterestPaid,
                        credit: 0,
                        description: `Pembayaran Angsuran ${credit.nomorKredit}`,
                    },
                ];
                if (totalPrincipalPaid > 0) {
                    journalDetails.push({
                        accountCode: receivableAccount,
                        debit: 0,
                        credit: totalPrincipalPaid,
                        description: `Angsuran Pokok ${credit.nomorKredit}`,
                    });
                }
                if (totalInterestPaid > 0) {
                    journalDetails.push({
                        accountCode: interestIncomeAccount,
                        debit: 0,
                        credit: totalInterestPaid,
                        description: `Angsuran Bunga ${credit.nomorKredit}`,
                    });
                }
                const journal = await tx.postedJournal.create({
                    data: {
                        journalNumber: journalNo,
                        journalDate: paymentDate,
                        description: `Angsuran Kredit ${credit.nomorKredit} - ${credit.nasabah.nama}`,
                        postingType: 'AUTO',
                        sourceCode: 'KREDIT',
                        refId: trans.id,
                        userId: userId,
                        status: 'POSTED',
                        transType: 'KREDIT_ANGSURAN',
                        details: {
                            create: journalDetails,
                        },
                    },
                });
                journalId = journal.id;
            }
            await tx.transKredit.update({
                where: { id: trans.id },
                data: {
                    pokokBayar: new client_1.Prisma.Decimal(totalPrincipalPaid),
                    bungaBayar: new client_1.Prisma.Decimal(totalInterestPaid),
                    journalId: journalId,
                },
            });
            return {
                message: 'Payment recorded successfully',
                allocatedPrincipal: totalPrincipalPaid,
                allocatedInterest: totalInterestPaid,
                remainingDeposit: remainingMoney,
            };
        })
            .catch((error) => {
            console.error('PAY INSTALLMENT ERROR:', error);
            throw error;
        });
    }
    async generateSpkNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const romanMonth = this.getRomanMonth(month);
        let counter = 1;
        const counterRecord = await this.prisma.lovValue.findUnique({
            where: { code_codeValue: { code: 'COUNTER', codeValue: 'SPK' } },
        });
        if (counterRecord) {
            counter = Number(counterRecord.description) + 1;
            await this.prisma.lovValue.update({
                where: { code_codeValue: { code: 'COUNTER', codeValue: 'SPK' } },
                data: { description: counter.toString() },
            });
        }
        else {
            await this.prisma.lovValue.create({
                data: {
                    code: 'COUNTER',
                    codeValue: 'SPK',
                    description: '1',
                    orderNum: 1,
                },
            });
        }
        const sequence = String(counter).padStart(3, '0');
        return `SPK/${sequence}/${romanMonth}/${year}`;
    }
    getRomanMonth(month) {
        const romans = [
            '',
            'I',
            'II',
            'III',
            'IV',
            'V',
            'VI',
            'VII',
            'VIII',
            'IX',
            'X',
            'XI',
            'XII',
        ];
        return romans[month] || '';
    }
    async generateAccountNumber(nasabahId) {
        const count = await this.prisma.debiturKredit.count({
            where: { nomorKredit: { not: null } },
        });
        return `K-${String(nasabahId).padStart(4, '0')}-${String(count + 1).padStart(3, '0')}`;
    }
    calculateInstallmentSchedule(plafond, bungaPct, duration, startDate) {
        const schedule = [];
        let currentSisaPokok = plafond;
        const angsuranPokok = plafond / duration;
        const angsuranBunga = plafond * (bungaPct / 100);
        for (let i = 1; i <= duration; i++) {
            let currentPokok = angsuranPokok;
            if (i === duration) {
                currentPokok = currentSisaPokok;
            }
            currentSisaPokok -= currentPokok;
            if (currentSisaPokok < 0.0001 && currentSisaPokok > -0.0001)
                currentSisaPokok = 0;
            const currentTotal = currentPokok + angsuranBunga;
            const dueDate = new Date(startDate);
            dueDate.setMonth(startDate.getMonth() + i);
            schedule.push({
                angsuranKe: i,
                tglJatuhTempo: dueDate,
                pokok: currentPokok,
                bunga: angsuranBunga,
                total: currentTotal,
                sisaPokok: currentSisaPokok,
            });
        }
        return schedule;
    }
    async findAll(page = 1, limit = 10, status) {
        const skip = (page - 1) * limit;
        const where = {};
        if (status)
            where.status = status;
        const [data, total] = await Promise.all([
            this.prisma.debiturKredit.findMany({
                where,
                include: { nasabah: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.debiturKredit.count({ where }),
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const credit = await this.prisma.debiturKredit.findUnique({
            where: { id },
            include: {
                nasabah: true,
                analysis: true,
                collaterals: {
                    include: { collateral: true },
                },
                fasilitas: true,
                realisasi: true,
                jadwal: {
                    orderBy: { angsuranKe: 'asc' },
                },
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });
        if (!credit)
            throw new common_1.NotFoundException('Credit application not found');
        return credit;
    }
};
exports.KreditService = KreditService;
exports.KreditService = KreditService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => accounting_service_1.AccountingService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        accounting_service_1.AccountingService])
], KreditService);
//# sourceMappingURL=kredit.service.js.map