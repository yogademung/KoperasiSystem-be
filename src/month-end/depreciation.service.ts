import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class DepreciationService {
    private readonly logger = new Logger(DepreciationService.name);

    constructor(private prisma: PrismaService) { }

    async calculateMonthlyDepreciation(period: string) {
        const [year, month] = period.split('-');
        // Determine last day of period
        const endDate = new Date(Date.UTC(+year, +month, 0));

        // Get Active Assets acquired before end of this period
        const assets = await this.prisma.asset.findMany({
            where: {
                status: 'ACTIVE',
                acquisitionDate: {
                    lte: endDate,
                },
            },
        });

        const items = [];
        let totalAmount = 0;

        for (const asset of assets) {
            // Simple Straight Line Calculation
            // (Cost - Residual) / (LifeYears * 12)
            let monthlyDepreciation = 0;

            if (asset.depreciationMethod === 'STRAIGHT_LINE') {
                const depreciableAmount = Number(asset.acquisitionCost) - Number(asset.residualValue);
                const lifeMonths = asset.usefulLifeYears * 12;
                if (lifeMonths > 0) {
                    monthlyDepreciation = depreciableAmount / lifeMonths;
                }
            } else if (asset.depreciationMethod === 'DECLINING_BALANCE') {
                // Simplified for now, or use Rate
                // Cost * (Rate/100) / 12
                monthlyDepreciation = Number(asset.acquisitionCost) * (asset.depreciationRate / 100) / 12;
            }

            // Round to 2 decimals
            monthlyDepreciation = Math.round(monthlyDepreciation * 100) / 100;

            // Ensure we don't depreciate more than remaining book value (not implemented deeply here for speed, but standard practice)

            if (monthlyDepreciation > 0) {
                items.push({
                    asset,
                    amount: monthlyDepreciation,
                });
                totalAmount += monthlyDepreciation;
            }
        }

        return { items, totalAmount };
    }

    async postMonthlyDepreciation(period: string, userId: number) {
        const [year, month] = period.split('-');

        // 1. Check if already posted for this period (Check MonthEndLog or existing Journal)
        // Checking Log is safer for "Process" idempotency
        const existing = await this.prisma.monthEndLog.findFirst({
            where: {
                period,
                action: 'DEPRECIATION',
                status: 'SUCCESS'
            }
        });

        if (existing) {
            throw new BadRequestException(`Depresiasi periode ${period} sudah diposting.`);
        }

        // 2. Calculate
        const { items, totalAmount } = await this.calculateMonthlyDepreciation(period);

        if (items.length === 0) {
            return { message: 'No assets to depreciate.' };
        }

        // 3. Post Journal and History
        await this.prisma.$transaction(async (tx) => {
            // Create Journal Header
            const journalNumber = `JU/DEP/${period}`; // Simplified format
            const journal = await tx.postedJournal.create({
                data: {
                    journalNumber,
                    journalDate: new Date(Date.UTC(+year, +month, 0)),
                    description: `Penyusutan Aset Tetap Periode ${period}`,
                    postingType: 'AUTO',
                    transType: 'DEPRECIATION',
                    status: 'POSTED',
                    userId,
                    details: {
                        create: [] // Will add via map/loop if supported or separate createMany
                    }
                }
            });

            // Create Journal Details (Group by Account to reduce lines)
            // Group by Expense Account and Accum Account
            const journalEntries = new Map<string, number>(); // AccountCode -> Net Amount (Debit positive)

            for (const item of items) {
                // Expense (Debit)
                const expAcc = item.asset.expenseAccountId;
                journalEntries.set(expAcc, (journalEntries.get(expAcc) || 0) + item.amount);

                // Accum (Credit)
                const accumAcc = item.asset.accumDepreciationAccountId;
                journalEntries.set(accumAcc, (journalEntries.get(accumAcc) || 0) - item.amount);

                // Create History Record
                await tx.assetDepreciationHistory.create({
                    data: {
                        assetId: item.asset.id,
                        period,
                        amount: item.amount,
                        journalId: journal.id
                    }
                });
            }

            // Insert Journal Details
            for (const [acc, amount] of journalEntries) {
                await tx.postedJournalDetail.create({
                    data: {
                        journalId: journal.id,
                        accountCode: acc,
                        debit: amount > 0 ? amount : 0,
                        credit: amount < 0 ? Math.abs(amount) : 0,
                        description: `Penyusutan ${period}`
                    }
                });
            }

            // Log
            await tx.monthEndLog.create({
                data: {
                    period,
                    action: 'DEPRECIATION',
                    status: 'SUCCESS',
                    performedBy: userId,
                    details: `Depreciation posted. Total: ${totalAmount}, Assets: ${items.length}`
                }
            });
        });

        this.logger.log(`Depreciation for ${period} posted. Total: ${totalAmount}`);
        return { success: true, count: items.length, total: totalAmount };
    }
}
