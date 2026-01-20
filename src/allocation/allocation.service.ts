import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AllocationMethod } from '@prisma/client';

@Injectable()
export class AllocationService {
    constructor(private prisma: PrismaService) { }

    async findAllRules() {
        return this.prisma.allocationRule.findMany({
            include: {
                creator: { select: { fullName: true } },
                targets: { include: { costCenter: true } }
            },
            orderBy: { createdAt: 'desc' },
            where: { isActive: true }
        });
    }

    async findOneRule(id: number) {
        const rule = await this.prisma.allocationRule.findUnique({
            where: { id },
            include: {
                targets: { include: { costCenter: true } }
            }
        });
        if (!rule) throw new NotFoundException('Rule not found');
        return rule;
    }

    async createRule(data: any, userId: number) {
        const { targets, ...ruleData } = data;

        return this.prisma.allocationRule.create({
            data: {
                ...ruleData,
                createdBy: userId,
                targets: {
                    create: targets.map((t: any) => ({
                        costCenterId: t.costCenterId,
                        weight: t.weight || 1,
                        targetPercentage: t.targetPercentage,
                        fixedAmount: t.fixedAmount
                    }))
                }
            }
        });
    }

    async deleteRule(id: number) {
        return this.prisma.allocationRule.update({
            where: { id },
            data: { isActive: false }
        });
    }

    // Execution Logic
    async previewAllocation(ruleId: number, year: number, month: number) {
        const rule = await this.findOneRule(ruleId);

        // 1. Get Source Amount
        const sourceAmount = await this.getSourceAmount(rule.sourceAccountCode, year, month);

        // 2. Calculate Allocation
        const details = this.calculateAllocation(rule, sourceAmount);

        return {
            rule,
            sourceAmount,
            period: { year, month },
            details,
            totalAllocated: details.reduce((sum, d) => sum + d.amount, 0)
        };
    }

    async executeAllocation(ruleId: number, year: number, month: number, userId: number) {
        // 1. Check if already executed
        const existing = await this.prisma.allocationExecution.findFirst({
            where: {
                ruleId,
                periodYear: year,
                periodMonth: month,
                status: 'EXECUTED'
            }
        });
        if (existing) throw new BadRequestException('Allocation already executed for this period');

        // 2. Preview
        const preview = await this.previewAllocation(ruleId, year, month);
        if (preview.sourceAmount <= 0) throw new BadRequestException('Source amount is zero or negative');

        // 3. Create Execution Record
        const execution = await this.prisma.allocationExecution.create({
            data: {
                ruleId,
                periodYear: year,
                periodMonth: month,
                executionDate: new Date(),
                totalAmount: preview.sourceAmount,
                status: 'EXECUTED',
                executedBy: userId,
                details: {
                    create: preview.details.map(d => ({
                        costCenterId: d.costCenterId,
                        allocatedAmount: d.amount,
                        percentage: d.percentage,
                        calculationBasis: d.basis
                    }))
                }
            }
        });

        // 4. Post Journal Entry (TODO: Implement actual Journal Posting integration)
        // For now, we assume the execution record is enough to track it.
        // In real implementation, we would call AccountingService.createJournal() here.

        return execution;
    }

    async getExecutions(periodYear?: number, periodMonth?: number) {
        const where: any = {};
        if (periodYear) where.periodYear = +periodYear;
        if (periodMonth) where.periodMonth = +periodMonth;

        return this.prisma.allocationExecution.findMany({
            where,
            include: {
                rule: true,
                executor: { select: { fullName: true } },
                details: { include: { costCenter: true } }
            },
            orderBy: { executedAt: 'desc' }
        });
    }

    async rollbackExecution(id: number, userId: number) {
        const execution = await this.prisma.allocationExecution.findUnique({ where: { id } });
        if (!execution) throw new NotFoundException('Execution not found');
        if (execution.status !== 'EXECUTED') throw new BadRequestException('Execution already rolled back');

        // Update status
        return this.prisma.allocationExecution.update({
            where: { id },
            data: {
                status: 'ROLLED_BACK',
                rolledBackBy: userId,
                rolledBackAt: new Date()
            }
        });

        // TODO: Reverse Journal Entry if posted
    }

    // Helper: Calculation Engine
    private calculateAllocation(rule: any, totalAmount: number) {
        const targets = rule.targets;
        const method = rule.allocationMethod;

        if (totalAmount <= 0 || !targets.length) {
            return [];
        }

        let result = [];

        if (method === 'EQUAL') {
            const amountPerTarget = totalAmount / targets.length;
            result = targets.map((t: any) => ({
                costCenterId: t.costCenterId,
                amount: amountPerTarget,
                percentage: (1 / targets.length) * 100,
                basis: 1
            }));
        } else {
            // Weighted Calculation (Area, Revenue, Headcount use weight field)
            const totalWeight = targets.reduce((sum: number, t: any) => sum + Number(t.weight || 0), 0);

            if (totalWeight === 0) {
                // Fallback to equal if no weights
                const amountPerTarget = totalAmount / targets.length;
                return targets.map((t: any) => ({
                    costCenterId: t.costCenterId,
                    amount: amountPerTarget,
                    percentage: (1 / targets.length) * 100,
                    basis: 0
                }));
            }

            result = targets.map((t: any) => {
                const weight = Number(t.weight || 0);
                const percentage = (weight / totalWeight);
                const amount = totalAmount * percentage;
                return {
                    costCenterId: t.costCenterId,
                    amount,
                    percentage: percentage * 100,
                    basis: weight
                };
            });
        }

        return result;
    }

    // Helper: Get Balance
    private async getSourceAmount(accountCode: string, year: number, month: number): Promise<number> {
        // Construct Date Range
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0); // Last day of month

        const aggregations = await this.prisma.postedJournalDetail.aggregate({
            where: {
                accountCode: accountCode,
                journal: {
                    journalDate: {
                        gte: startDate,
                        lte: endDate
                    },
                    status: 'POSTED'
                }
            },
            _sum: {
                debit: true,
                credit: true
            }
        });

        const debit = Number(aggregations._sum.debit || 0);
        const credit = Number(aggregations._sum.credit || 0);

        // Assuming Expense Account (Debit Balance)
        return debit - credit;
    }
}
