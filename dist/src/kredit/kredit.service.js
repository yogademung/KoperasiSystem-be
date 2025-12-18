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
        return this.prisma.$transaction(async (tx) => {
            const collateral = await tx.collateral.create({
                data: {
                    nasabahId: data.nasabahId,
                    type: data.type,
                    description: data.description,
                    marketValue: new client_1.Prisma.Decimal(data.marketValue),
                    assessedValue: new client_1.Prisma.Decimal(data.assessedValue),
                    details: data.details,
                    photos: data.photos || null,
                    status: 'ACTIVE',
                    createdBy: userId.toString(),
                },
            });
            await tx.kreditCollateral.create({
                data: {
                    creditId,
                    collateralId: collateral.id,
                },
            });
            return collateral;
        });
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
        const nomorKredit = await this.generateAccountNumber(credit.nasabahId);
        return this.prisma.$transaction(async (tx) => {
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
            const journalDetails = [
                { accountCode: '1301', debit: Number(data.plafond), credit: 0, description: `Pencairan Kredit ${nomorKredit}` },
                { accountCode: '1101', debit: 0, credit: Number(data.plafond), description: `Pencairan Kredit ${nomorKredit}` },
            ];
            const journal = await this.accountingService.createManualJournal({
                date: new Date(),
                description: `Realisasi Kredit ${nomorKredit} - ${credit.nasabah.nama}`,
                userId,
                details: journalDetails,
            });
            await tx.postedJournal.update({
                where: { id: journal.id },
                data: { postingType: 'AUTO', sourceCode: 'KREDIT', refId: realization.id },
            });
            return tx.debiturKredit.update({
                where: { id: creditId },
                data: {
                    nomorKredit,
                    status: 'ACTIVE',
                    updatedBy: userId.toString(),
                },
            });
        });
    }
    async generateAccountNumber(nasabahId) {
        const count = await this.prisma.debiturKredit.count({
            where: { nomorKredit: { not: null } }
        });
        return `K-${String(nasabahId).padStart(4, '0')}-${String(count + 1).padStart(3, '0')}`;
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