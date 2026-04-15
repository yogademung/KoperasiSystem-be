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
exports.BudgetService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let BudgetService = class BudgetService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createPeriod(dto, userId) {
        if (new Date(dto.startDate) >= new Date(dto.endDate)) {
            throw new common_1.BadRequestException('Tanggal mulai harus sebelum tanggal selesai');
        }
        const existing = await this.prisma.budgetPeriod.findFirst({
            where: {
                year: dto.year,
                periodName: dto.periodName,
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('Periode dengan nama ini sudah ada untuk tahun tersebut');
        }
        return this.prisma.budgetPeriod.create({
            data: {
                ...dto,
                createdBy: userId,
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
            },
        });
    }
    async findAllPeriods(filters = {}) {
        const where = {};
        if (filters.year) {
            where.year = filters.year;
        }
        if (filters.status) {
            where.status = filters.status;
        }
        return this.prisma.budgetPeriod.findMany({
            where,
            include: {
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
                approver: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
                _count: {
                    select: {
                        unitBudgets: true,
                    },
                },
            },
            orderBy: [{ year: 'desc' }, { startDate: 'desc' }],
        });
    }
    async findOnePeriod(id) {
        const period = await this.prisma.budgetPeriod.findUnique({
            where: { id },
            include: {
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
                approver: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
                _count: {
                    select: {
                        unitBudgets: true,
                    },
                },
            },
        });
        if (!period) {
            throw new common_1.NotFoundException('Periode anggaran tidak ditemukan');
        }
        return period;
    }
    async updatePeriod(id, dto) {
        await this.findOnePeriod(id);
        if (dto.startDate && dto.endDate) {
            if (new Date(dto.startDate) >= new Date(dto.endDate)) {
                throw new common_1.BadRequestException('Tanggal mulai harus sebelum tanggal selesai');
            }
        }
        return this.prisma.budgetPeriod.update({
            where: { id },
            data: dto,
            include: {
                creator: true,
                approver: true,
            },
        });
    }
    async approvePeriod(id, userId) {
        const period = await this.findOnePeriod(id);
        if (period.status !== 'DRAFT') {
            throw new common_1.BadRequestException('Hanya periode DRAFT yang bisa disetujui');
        }
        return this.prisma.budgetPeriod.update({
            where: { id },
            data: {
                status: 'APPROVED',
                approvedBy: userId,
                approvedAt: new Date(),
            },
        });
    }
    async closePeriod(id) {
        const period = await this.findOnePeriod(id);
        if (period.status === 'CLOSED') {
            throw new common_1.BadRequestException('Periode sudah ditutup');
        }
        return this.prisma.budgetPeriod.update({
            where: { id },
            data: { status: 'CLOSED' },
        });
    }
    async createBudget(dto, userId) {
        await this.findOnePeriod(dto.periodId);
        const existing = await this.prisma.unitBudget.findFirst({
            where: {
                periodId: dto.periodId,
                costCenterId: dto.costCenterId || null,
                businessUnitId: dto.businessUnitId || null,
                accountCode: dto.accountCode,
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('Entry anggaran untuk kombinasi ini sudah ada');
        }
        return this.prisma.unitBudget.create({
            data: {
                ...dto,
                createdBy: userId,
            },
            include: {
                period: true,
                costCenter: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
                businessUnit: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
            },
        });
    }
    async findAllBudgets(filters = {}) {
        const where = {};
        if (filters.periodId) {
            where.periodId = filters.periodId;
        }
        if (filters.costCenterId) {
            where.costCenterId = filters.costCenterId;
        }
        if (filters.businessUnitId) {
            where.businessUnitId = filters.businessUnitId;
        }
        if (filters.accountCode) {
            where.accountCode = { contains: filters.accountCode };
        }
        if (filters.search) {
            where.OR = [
                { accountCode: { contains: filters.search } },
                { notes: { contains: filters.search } },
            ];
        }
        return this.prisma.unitBudget.findMany({
            where,
            include: {
                period: true,
                costCenter: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
                businessUnit: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
            },
            orderBy: [{ accountCode: 'asc' }],
        });
    }
    async findOneBudget(id) {
        const budget = await this.prisma.unitBudget.findUnique({
            where: { id },
            include: {
                period: true,
                costCenter: true,
                businessUnit: true,
                creator: true,
            },
        });
        if (!budget) {
            throw new common_1.NotFoundException('Entry anggaran tidak ditemukan');
        }
        return budget;
    }
    async updateBudget(id, dto) {
        await this.findOneBudget(id);
        return this.prisma.unitBudget.update({
            where: { id },
            data: dto,
            include: {
                period: true,
                costCenter: true,
                businessUnit: true,
            },
        });
    }
    async deleteBudget(id) {
        await this.findOneBudget(id);
        return this.prisma.unitBudget.delete({
            where: { id },
        });
    }
    async calculateActual(periodId, accountCode, costCenterId, businessUnitId) {
        const period = await this.findOnePeriod(periodId);
        const where = {
            accountCode: accountCode,
            postedJournal: {
                journalDate: {
                    gte: period.startDate,
                    lte: period.endDate,
                },
            },
        };
        if (costCenterId) {
            where.costCenterId = costCenterId;
        }
        if (businessUnitId) {
            where.businessUnitId = businessUnitId;
        }
        const result = await this.prisma.postedJournalDetail.aggregate({
            where,
            _sum: {
                debit: true,
                credit: true,
            },
        });
        const isExpense = accountCode.startsWith('5');
        const actual = isExpense
            ? Number(result._sum.debit || 0)
            : Number(result._sum.credit || 0);
        return actual;
    }
    async getVarianceReport(periodId, costCenterId, businessUnitId) {
        const period = await this.findOnePeriod(periodId);
        const budgets = await this.findAllBudgets({
            periodId,
            costCenterId,
            businessUnitId,
        });
        const details = await Promise.all(budgets.map(async (budget) => {
            const actual = await this.calculateActual(periodId, budget.accountCode, budget.costCenterId || undefined, budget.businessUnitId || undefined);
            const budgetAmount = Number(budget.budgetAmount);
            const variance = budgetAmount - actual;
            const variancePercent = budgetAmount > 0 ? (variance / budgetAmount) * 100 : 0;
            let status;
            if (actual < budgetAmount * 0.9)
                status = 'UNDER';
            else if (actual > budgetAmount)
                status = 'OVER';
            else
                status = 'ON_TRACK';
            return {
                budgetId: budget.id,
                accountCode: budget.accountCode,
                costCenter: budget.costCenter?.name,
                businessUnit: budget.businessUnit?.name,
                budget: budgetAmount,
                actual,
                variance,
                variancePercent,
                status,
            };
        }));
        const totalBudget = details.reduce((sum, d) => sum + d.budget, 0);
        const totalActual = details.reduce((sum, d) => sum + d.actual, 0);
        const totalVariance = totalBudget - totalActual;
        const variancePercent = totalBudget > 0 ? (totalVariance / totalBudget) * 100 : 0;
        return {
            period,
            summary: {
                totalBudget,
                totalActual,
                totalVariance,
                variancePercent,
            },
            details,
        };
    }
    async copyFromPreviousPeriod(sourcePeriodId, targetPeriodId, userId, adjustmentPercent = 0) {
        const sourcePeriod = await this.findOnePeriod(sourcePeriodId);
        const targetPeriod = await this.findOnePeriod(targetPeriodId);
        const sourceBudgets = await this.findAllBudgets({
            periodId: sourcePeriodId,
        });
        if (sourceBudgets.length === 0) {
            throw new common_1.BadRequestException('Periode sumber tidak memiliki entry anggaran');
        }
        await this.prisma.unitBudget.deleteMany({
            where: { periodId: targetPeriodId },
        });
        const copiedBudgets = await Promise.all(sourceBudgets.map(async (source) => {
            const adjustedAmount = Number(source.budgetAmount) * (1 + adjustmentPercent / 100);
            return this.prisma.unitBudget.create({
                data: {
                    periodId: targetPeriodId,
                    costCenterId: source.costCenterId,
                    businessUnitId: source.businessUnitId,
                    accountCode: source.accountCode,
                    budgetAmount: adjustedAmount,
                    notes: `Copied from ${sourcePeriod.periodName}${adjustmentPercent !== 0 ? ` with ${adjustmentPercent}% adjustment` : ''}`,
                    createdBy: userId,
                },
            });
        }));
        return {
            copiedCount: copiedBudgets.length,
            targetPeriod,
        };
    }
    async getBudgetUtilization(costCenterId, periodId) {
        const budgets = await this.findAllBudgets({ costCenterId, periodId });
        const totalBudget = budgets.reduce((sum, b) => sum + Number(b.budgetAmount), 0);
        const actualPromises = budgets.map((b) => this.calculateActual(periodId, b.accountCode, costCenterId));
        const actuals = await Promise.all(actualPromises);
        const totalActual = actuals.reduce((sum, a) => sum + a, 0);
        const variance = totalBudget - totalActual;
        const utilizationPercent = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;
        return {
            costCenterId,
            periodId,
            totalBudget,
            totalActual,
            variance,
            utilizationPercent,
        };
    }
};
exports.BudgetService = BudgetService;
exports.BudgetService = BudgetService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BudgetService);
//# sourceMappingURL=budget.service.js.map