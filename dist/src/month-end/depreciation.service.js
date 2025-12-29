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
var DepreciationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepreciationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let DepreciationService = DepreciationService_1 = class DepreciationService {
    prisma;
    logger = new common_1.Logger(DepreciationService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async calculateMonthlyDepreciation(period) {
        const [year, month] = period.split('-');
        const endDate = new Date(Date.UTC(+year, +month, 0));
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
            let monthlyDepreciation = 0;
            if (asset.depreciationMethod === 'STRAIGHT_LINE') {
                const depreciableAmount = Number(asset.acquisitionCost) - Number(asset.residualValue);
                const lifeMonths = asset.usefulLifeYears * 12;
                if (lifeMonths > 0) {
                    monthlyDepreciation = depreciableAmount / lifeMonths;
                }
            }
            else if (asset.depreciationMethod === 'DECLINING_BALANCE') {
                monthlyDepreciation = Number(asset.acquisitionCost) * (asset.depreciationRate / 100) / 12;
            }
            monthlyDepreciation = Math.round(monthlyDepreciation * 100) / 100;
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
    async postMonthlyDepreciation(period, userId) {
        const [year, month] = period.split('-');
        const existing = await this.prisma.monthEndLog.findFirst({
            where: {
                period,
                action: 'DEPRECIATION',
                status: 'SUCCESS'
            }
        });
        if (existing) {
            throw new common_1.BadRequestException(`Depresiasi periode ${period} sudah diposting.`);
        }
        const { items, totalAmount } = await this.calculateMonthlyDepreciation(period);
        if (items.length === 0) {
            return { message: 'No assets to depreciate.' };
        }
        await this.prisma.$transaction(async (tx) => {
            const journalNumber = `JU/DEP/${period}`;
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
                        create: []
                    }
                }
            });
            const journalEntries = new Map();
            for (const item of items) {
                const expAcc = item.asset.expenseAccountId;
                journalEntries.set(expAcc, (journalEntries.get(expAcc) || 0) + item.amount);
                const accumAcc = item.asset.accumDepreciationAccountId;
                journalEntries.set(accumAcc, (journalEntries.get(accumAcc) || 0) - item.amount);
                await tx.assetDepreciationHistory.create({
                    data: {
                        assetId: item.asset.id,
                        period,
                        amount: item.amount,
                        journalId: journal.id
                    }
                });
            }
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
};
exports.DepreciationService = DepreciationService;
exports.DepreciationService = DepreciationService = DepreciationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DepreciationService);
//# sourceMappingURL=depreciation.service.js.map