import { Injectable, BadRequestException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma } from '@prisma/client';
import { AccountingService } from '../accounting/accounting.service';

@Injectable()
export class KreditService {
    constructor(
        private prisma: PrismaService,
        @Inject(forwardRef(() => AccountingService))
        private accountingService: AccountingService,
    ) { }

    // ============================================
    // 1. APPLICATION (OPEN)
    // ============================================

    async createApplication(data: any, userId: number) {
        const noPermohonan = await this.generatePermohonanNumber();

        return this.prisma.debiturKredit.create({
            data: {
                nasabahId: data.nasabahId,
                noPermohonan,
                jenisKredit: data.jenisKredit,
                tujuanKredit: data.tujuanKredit,
                nominalPengajuan: new Prisma.Decimal(data.nominalPengajuan),
                mohonJangkaWaktu: data.mohonJangkaWaktu,
                mohonSukuBunga: new Prisma.Decimal(data.mohonSukuBunga),
                metodeAngsuran: data.metodeAngsuran,
                sistemBunga: data.sistemBunga,
                tglPengajuan: new Date(),
                status: 'OPEN',
                createdBy: userId.toString(),
            },
        });
    }

    private async generatePermohonanNumber(): Promise<string> {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const prefix = `PK/${year}/${month}`;

        const count = await this.prisma.debiturKredit.count({
            where: { noPermohonan: { startsWith: prefix } },
        });

        return `${prefix}/${String(count + 1).padStart(4, '0')}`;
    }

    // ============================================
    // 2. COLLATERAL MANAGEMENT
    // ============================================

    async addCollateral(creditId: number, data: any, userId: number) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Create Collateral Master
            const collateral = await tx.collateral.create({
                data: {
                    nasabahId: data.nasabahId,
                    type: data.type,
                    description: data.description,
                    marketValue: new Prisma.Decimal(data.marketValue),
                    assessedValue: new Prisma.Decimal(data.assessedValue),
                    details: data.details, // Json
                    photos: data.photos || null, // JSON string of photo paths
                    status: 'ACTIVE',
                    createdBy: userId.toString(),
                },
            });

            // 2. Link to Credit Application
            await tx.kreditCollateral.create({
                data: {
                    creditId,
                    collateralId: collateral.id,
                },
            });

            return collateral;
        });
    }

    // ============================================
    // 3. ANALYSIS (ANALYZE)
    // ============================================

    async submitAnalysis(creditId: number, data: any, userId: number) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Create/Update Analysis
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

            // 2. Update Status to ANALYZE if it was OPEN
            await tx.debiturKredit.update({
                where: { id: creditId },
                data: { status: 'ANALYZE' },
            });

            return analysis;
        });
    }

    // ============================================
    // 4. APPROVAL & ACTIVATION
    // ============================================

    async approveCredit(creditId: number, decision: any, userId: number) {
        return this.prisma.debiturKredit.update({
            where: { id: creditId },
            data: {
                status: decision.status, // APPROVE or CANCEL
                updatedBy: userId.toString(),
            },
        });
    }

    async activateCredit(creditId: number, data: any, userId: number) {
        const credit = await this.prisma.debiturKredit.findUnique({
            where: { id: creditId },
            include: { nasabah: true },
        });

        if (!credit || credit.status !== 'APPROVE') {
            throw new BadRequestException('Credit application is not approved or not found');
        }

        const nomorKredit = await this.generateAccountNumber(credit.nasabahId);

        return this.prisma.$transaction(async (tx) => {
            // 1. Set Facilities
            await tx.debiturFasilitas.create({
                data: {
                    debiturKreditId: creditId,
                    nominal: new Prisma.Decimal(data.plafond),
                    bunga: new Prisma.Decimal(data.bungaPct),
                    jangkaWaktu: data.jangkaWaktu,
                    angsuranPokok: new Prisma.Decimal(data.angsuranPokok),
                    angsuranBunga: new Prisma.Decimal(data.angsuranBunga),
                    createdBy: userId.toString(),
                },
            });

            // 2. Record Realization
            const realization = await tx.debiturRealisasi.create({
                data: {
                    debiturKreditId: creditId,
                    tglRealisasi: new Date(),
                    nominalRealisasi: new Prisma.Decimal(data.plafond),
                    createdBy: userId.toString(),
                },
            });

            // 3. Post Journal (Automated)
            // DR: Piutang Kredit (1301)
            // CR: Kas (1101)
            // CR: Pendapatan Adm/Provisi (Optional, for now just simple realization)

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

            // Update journal to AUTO and sourceCode KREDIT
            await tx.postedJournal.update({
                where: { id: journal.id },
                data: { postingType: 'AUTO', sourceCode: 'KREDIT', refId: realization.id },
            });

            // 4. Update Credit Status to ACTIVE
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

    private async generateAccountNumber(nasabahId: number): Promise<string> {
        // Simplified account number logic: K.NASABAH_ID.SEQUENCE
        const count = await this.prisma.debiturKredit.count({
            where: { nomorKredit: { not: null } }
        });
        return `K-${String(nasabahId).padStart(4, '0')}-${String(count + 1).padStart(3, '0')}`;
    }

    // ============================================
    // QUERIES
    // ============================================

    async findAll(page: number = 1, limit: number = 10, status?: string) {
        const skip = (page - 1) * limit;
        const where: any = {};
        if (status) where.status = status;

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

    async findOne(id: number) {
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
        if (!credit) throw new NotFoundException('Credit application not found');
        return credit;
    }
}
