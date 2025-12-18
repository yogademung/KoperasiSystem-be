import { Injectable, BadRequestException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';
import { AccountingService } from '../accounting.service';

@Injectable()
export class AssetService {
    constructor(
        private prisma: PrismaService,
        @Inject(forwardRef(() => AccountingService))
        private accountingService: AccountingService
    ) { }

    async create(data: any) {
        return this.prisma.asset.create({
            data: {
                ...data,
                acquisitionCost: new Prisma.Decimal(data.acquisitionCost),
                residualValue: new Prisma.Decimal(data.residualValue || 0),
            }
        });
    }

    async findAll(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.asset.findMany({
                skip,
                take: limit,
                orderBy: { code: 'asc' }
            }),
            this.prisma.asset.count()
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async findOne(id: number) {
        const asset = await this.prisma.asset.findUnique({
            where: { id },
            include: { depreciationHistory: true }
        });
        if (!asset) throw new NotFoundException('Asset not found');
        return asset;
    }

    async update(id: number, data: any) {
        const updateData: any = { ...data };
        if (data.acquisitionCost) updateData.acquisitionCost = new Prisma.Decimal(data.acquisitionCost);
        if (data.residualValue) updateData.residualValue = new Prisma.Decimal(data.residualValue);

        return this.prisma.asset.update({
            where: { id },
            data: updateData
        });
    }

    async remove(id: number) {
        return this.prisma.asset.delete({ where: { id } });
    }

    async calculateMonthlyDepreciation(assetId: number, date: Date) {
        const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
        if (!asset) throw new NotFoundException('Asset not found');

        if (asset.depreciationMethod === 'STRAIGHT_LINE') {
            // Formula: (Cost - Residual) * (Rate / 100) / 12
            const amount = (Number(asset.acquisitionCost) - Number(asset.residualValue)) * (asset.depreciationRate / 100) / 12;
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
                acquisitionDate: { lte: date }
            }
        });

        const results: { assetId: number; amount: number }[] = [];
        let totalDepreciation = 0;

        const journalEntries: { expenseAccount: string, accumAccount: string, amount: number, assetId: number }[] = [];

        for (const asset of assets) {
            // Check if already depreciated for this period
            const existing = await this.prisma.assetDepreciationHistory.findFirst({
                where: { assetId: asset.id, period }
            });

            if (existing) continue;

            const amount = await this.calculateMonthlyDepreciation(asset.id, date);
            if (amount <= 0) continue;

            totalDepreciation += amount;

            journalEntries.push({
                expenseAccount: asset.expenseAccountId,
                accumAccount: asset.accumDepreciationAccountId,
                amount,
                assetId: asset.id
            });

            results.push({ assetId: asset.id, amount });
        }

        if (journalEntries.length === 0) {
            return { message: 'No assets to depreciate for this period' };
        }

        // Post Journal (Consolidated)
        return this.prisma.$transaction(async (tx) => {
            const details: { accountCode: string, debit: number, credit: number, description: string }[] = [];

            // Group by account to avoid split rows in journal
            const groupedDetails: Map<string, { debit: number, credit: number }> = new Map();

            for (const entry of journalEntries) {
                // Debit Expense
                const exp = groupedDetails.get(entry.expenseAccount) || { debit: 0, credit: 0 };
                groupedDetails.set(entry.expenseAccount, {
                    debit: exp.debit + entry.amount,
                    credit: exp.credit
                });

                // Credit Accumulated
                const acc = groupedDetails.get(entry.accumAccount) || { debit: 0, credit: 0 };
                groupedDetails.set(entry.accumAccount, {
                    debit: acc.debit,
                    credit: acc.credit + entry.amount
                });
            }

            const finalDetails = Array.from(groupedDetails.entries()).map(([code, val]) => ({
                accountCode: code,
                debit: val.debit,
                credit: val.credit,
                description: `Penyusutan Aktiva - ${period}`
            }));

            // Generate Journal
            const manualData = {
                date: new Date(),
                description: `Penyusutan Aktiva Otomatis - Periode ${period}`,
                userId,
                details: finalDetails
            };

            const journal = await this.accountingService.createManualJournal(manualData);

            // Overwrite postingType to 'AUTO' and sourceCode to 'ASSET'
            await tx.postedJournal.update({
                where: { id: journal.id },
                data: { postingType: 'AUTO', sourceCode: 'ASSET' }
            });

            // Save History
            for (const res of results) {
                await tx.assetDepreciationHistory.create({
                    data: {
                        assetId: res.assetId,
                        period,
                        amount: new Prisma.Decimal(res.amount),
                        journalId: journal.id
                    }
                });

                // Update Asset current status if useful life expired (optional improvement)
                // For now just record the history
            }

            return { journalId: journal.id, processedCount: results.length, totalAmount: totalDepreciation };
        });
    }
}
