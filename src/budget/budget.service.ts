import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { BudgetPeriodStatus } from '@prisma/client';

// DTOs
export interface CreateBudgetPeriodDto {
    year: number;
    periodName: string;
    startDate: Date;
    endDate: Date;
}

export interface UpdateBudgetPeriodDto {
    periodName?: string;
    startDate?: Date;
    endDate?: Date;
    status?: BudgetPeriodStatus;
}

export interface CreateBudgetDto {
    periodId: number;
    costCenterId?: number;
    businessUnitId?: number;
    accountCode: string;
    budgetAmount: number;
    notes?: string;
}

export interface UpdateBudgetDto {
    budgetAmount?: number;
    notes?: string;
}

export interface BudgetFilters {
    periodId?: number;
    costCenterId?: number;
    businessUnitId?: number;
    accountCode?: string;
    search?: string;
}

export interface PeriodFilters {
    year?: number;
    status?: BudgetPeriodStatus;
}

@Injectable()
export class BudgetService {
    constructor(private prisma: PrismaService) { }

    // ============================================
    // Budget Period Management
    // ============================================

    async createPeriod(dto: CreateBudgetPeriodDto, userId: number) {
        // Validate dates
        if (new Date(dto.startDate) >= new Date(dto.endDate)) {
            throw new BadRequestException('Tanggal mulai harus sebelum tanggal selesai');
        }

        // Check for overlapping periods
        const existing = await this.prisma.budgetPeriod.findFirst({
            where: {
                year: dto.year,
                periodName: dto.periodName,
            },
        });

        if (existing) {
            throw new BadRequestException('Periode dengan nama ini sudah ada untuk tahun tersebut');
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

    async findAllPeriods(filters: PeriodFilters = {}) {
        const where: any = {};

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
            orderBy: [
                { year: 'desc' },
                { startDate: 'desc' },
            ],
        });
    }

    async findOnePeriod(id: number) {
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
            throw new NotFoundException('Periode anggaran tidak ditemukan');
        }

        return period;
    }

    async updatePeriod(id: number, dto: UpdateBudgetPeriodDto) {
        await this.findOnePeriod(id);

        if (dto.startDate && dto.endDate) {
            if (new Date(dto.startDate) >= new Date(dto.endDate)) {
                throw new BadRequestException('Tanggal mulai harus sebelum tanggal selesai');
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

    async approvePeriod(id: number, userId: number) {
        const period = await this.findOnePeriod(id);

        if (period.status !== 'DRAFT') {
            throw new BadRequestException('Hanya periode DRAFT yang bisa disetujui');
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

    async closePeriod(id: number) {
        const period = await this.findOnePeriod(id);

        if (period.status === 'CLOSED') {
            throw new BadRequestException('Periode sudah ditutup');
        }

        return this.prisma.budgetPeriod.update({
            where: { id },
            data: { status: 'CLOSED' },
        });
    }

    // ============================================
    // Budget Entry Management
    // ============================================

    async createBudget(dto: CreateBudgetDto, userId: number) {
        // Verify period exists
        await this.findOnePeriod(dto.periodId);

        // Check for duplicate
        const existing = await this.prisma.unitBudget.findFirst({
            where: {
                periodId: dto.periodId,
                costCenterId: dto.costCenterId || null,
                businessUnitId: dto.businessUnitId || null,
                accountCode: dto.accountCode,
            },
        });

        if (existing) {
            throw new BadRequestException('Entry anggaran untuk kombinasi ini sudah ada');
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

    async findAllBudgets(filters: BudgetFilters = {}) {
        const where: any = {};

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
            orderBy: [
                { accountCode: 'asc' },
            ],
        });
    }

    async findOneBudget(id: number) {
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
            throw new NotFoundException('Entry anggaran tidak ditemukan');
        }

        return budget;
    }

    async updateBudget(id: number, dto: UpdateBudgetDto) {
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

    async deleteBudget(id: number) {
        await this.findOneBudget(id);

        return this.prisma.unitBudget.delete({
            where: { id },
        });
    }

    // ============================================
    // Budget Analysis & Reporting
    // ============================================

    async calculateActual(
        periodId: number,
        accountCode: string,
        costCenterId?: number,
        businessUnitId?: number,
    ): Promise<number> {
        const period = await this.findOnePeriod(periodId);

        const where: any = {
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

        // For expense accounts (5.x.x), use debit
        // For revenue accounts (4.x.x), use credit
        const isExpense = accountCode.startsWith('5');
        const actual = isExpense
            ? Number(result._sum.debit || 0)
            : Number(result._sum.credit || 0);

        return actual;
    }

    async getVarianceReport(
        periodId: number,
        costCenterId?: number,
        businessUnitId?: number,
    ) {
        const period = await this.findOnePeriod(periodId);

        // Get all budgets for this period
        const budgets = await this.findAllBudgets({
            periodId,
            costCenterId,
            businessUnitId,
        });

        // Calculate actual for each budget entry
        const details = await Promise.all(
            budgets.map(async (budget) => {
                const actual = await this.calculateActual(
                    periodId,
                    budget.accountCode,
                    budget.costCenterId || undefined,
                    budget.businessUnitId || undefined,
                );

                const budgetAmount = Number(budget.budgetAmount);
                const variance = budgetAmount - actual;
                const variancePercent = budgetAmount > 0 ? (variance / budgetAmount) * 100 : 0;

                let status: 'UNDER' | 'OVER' | 'ON_TRACK';
                if (actual < budgetAmount * 0.9) status = 'UNDER';
                else if (actual > budgetAmount) status = 'OVER';
                else status = 'ON_TRACK';

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
            }),
        );

        // Calculate summary
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

    async copyFromPreviousPeriod(
        sourcePeriodId: number,
        targetPeriodId: number,
        userId: number,
        adjustmentPercent: number = 0,
    ) {
        const sourcePeriod = await this.findOnePeriod(sourcePeriodId);
        const targetPeriod = await this.findOnePeriod(targetPeriodId);

        // Get all budgets from source period
        const sourceBudgets = await this.findAllBudgets({ periodId: sourcePeriodId });

        if (sourceBudgets.length === 0) {
            throw new BadRequestException('Periode sumber tidak memiliki entry anggaran');
        }

        // Delete existing budgets in target period (if any)
        await this.prisma.unitBudget.deleteMany({
            where: { periodId: targetPeriodId },
        });

        // Copy budgets with adjustment
        const copiedBudgets = await Promise.all(
            sourceBudgets.map(async (source) => {
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
            }),
        );

        return {
            copiedCount: copiedBudgets.length,
            targetPeriod,
        };
    }

    async getBudgetUtilization(costCenterId: number, periodId: number) {
        const budgets = await this.findAllBudgets({ costCenterId, periodId });

        const totalBudget = budgets.reduce((sum, b) => sum + Number(b.budgetAmount), 0);

        const actualPromises = budgets.map(b =>
            this.calculateActual(periodId, b.accountCode, costCenterId),
        );

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
}
