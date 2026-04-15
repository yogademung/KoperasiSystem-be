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
exports.AllocationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let AllocationService = class AllocationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllRules() {
        return this.prisma.allocationRule.findMany({
            include: {
                creator: { select: { fullName: true } },
                targets: { include: { costCenter: true } },
            },
            orderBy: { createdAt: 'desc' },
            where: { isActive: true },
        });
    }
    async findOneRule(id) {
        const rule = await this.prisma.allocationRule.findUnique({
            where: { id },
            include: {
                targets: { include: { costCenter: true } },
            },
        });
        if (!rule)
            throw new common_1.NotFoundException('Rule not found');
        return rule;
    }
    async createRule(data, userId) {
        const { targets, ...ruleData } = data;
        return this.prisma.allocationRule.create({
            data: {
                ...ruleData,
                createdBy: userId,
                targets: {
                    create: targets.map((t) => ({
                        costCenterId: t.costCenterId,
                        weight: t.weight || 1,
                        targetPercentage: t.targetPercentage,
                        fixedAmount: t.fixedAmount,
                    })),
                },
            },
        });
    }
    async deleteRule(id) {
        return this.prisma.allocationRule.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async previewAllocation(ruleId, year, month) {
        const rule = await this.findOneRule(ruleId);
        const sourceAmount = await this.getSourceAmount(rule.sourceAccountCode, year, month);
        const details = this.calculateAllocation(rule, sourceAmount);
        return {
            rule,
            sourceAmount,
            period: { year, month },
            details,
            totalAllocated: details.reduce((sum, d) => sum + d.amount, 0),
        };
    }
    async executeAllocation(ruleId, year, month, userId) {
        const existing = await this.prisma.allocationExecution.findFirst({
            where: {
                ruleId,
                periodYear: year,
                periodMonth: month,
                status: 'EXECUTED',
            },
        });
        if (existing)
            throw new common_1.BadRequestException('Allocation already executed for this period');
        const preview = await this.previewAllocation(ruleId, year, month);
        if (preview.sourceAmount <= 0)
            throw new common_1.BadRequestException('Source amount is zero or negative');
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
                    create: preview.details.map((d) => ({
                        costCenterId: d.costCenterId,
                        allocatedAmount: d.amount,
                        percentage: d.percentage,
                        calculationBasis: d.basis,
                    })),
                },
            },
        });
        return execution;
    }
    async getExecutions(periodYear, periodMonth) {
        const where = {};
        if (periodYear)
            where.periodYear = +periodYear;
        if (periodMonth)
            where.periodMonth = +periodMonth;
        return this.prisma.allocationExecution.findMany({
            where,
            include: {
                rule: true,
                executor: { select: { fullName: true } },
                details: { include: { costCenter: true } },
            },
            orderBy: { executedAt: 'desc' },
        });
    }
    async rollbackExecution(id, userId) {
        const execution = await this.prisma.allocationExecution.findUnique({
            where: { id },
        });
        if (!execution)
            throw new common_1.NotFoundException('Execution not found');
        if (execution.status !== 'EXECUTED')
            throw new common_1.BadRequestException('Execution already rolled back');
        return this.prisma.allocationExecution.update({
            where: { id },
            data: {
                status: 'ROLLED_BACK',
                rolledBackBy: userId,
                rolledBackAt: new Date(),
            },
        });
    }
    calculateAllocation(rule, totalAmount) {
        const targets = rule.targets;
        const method = rule.allocationMethod;
        if (totalAmount <= 0 || !targets.length) {
            return [];
        }
        let result = [];
        if (method === 'EQUAL') {
            const amountPerTarget = totalAmount / targets.length;
            result = targets.map((t) => ({
                costCenterId: t.costCenterId,
                amount: amountPerTarget,
                percentage: (1 / targets.length) * 100,
                basis: 1,
            }));
        }
        else {
            const totalWeight = targets.reduce((sum, t) => sum + Number(t.weight || 0), 0);
            if (totalWeight === 0) {
                const amountPerTarget = totalAmount / targets.length;
                return targets.map((t) => ({
                    costCenterId: t.costCenterId,
                    amount: amountPerTarget,
                    percentage: (1 / targets.length) * 100,
                    basis: 0,
                }));
            }
            result = targets.map((t) => {
                const weight = Number(t.weight || 0);
                const percentage = weight / totalWeight;
                const amount = totalAmount * percentage;
                return {
                    costCenterId: t.costCenterId,
                    amount,
                    percentage: percentage * 100,
                    basis: weight,
                };
            });
        }
        return result;
    }
    async getSourceAmount(accountCode, year, month) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        const aggregations = await this.prisma.postedJournalDetail.aggregate({
            where: {
                accountCode: accountCode,
                journal: {
                    journalDate: {
                        gte: startDate,
                        lte: endDate,
                    },
                    status: 'POSTED',
                },
            },
            _sum: {
                debit: true,
                credit: true,
            },
        });
        const debit = Number(aggregations._sum.debit || 0);
        const credit = Number(aggregations._sum.credit || 0);
        return debit - credit;
    }
};
exports.AllocationService = AllocationService;
exports.AllocationService = AllocationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AllocationService);
//# sourceMappingURL=allocation.service.js.map