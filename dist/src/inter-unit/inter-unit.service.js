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
exports.InterUnitService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const accounting_service_1 = require("../accounting/accounting.service");
let InterUnitService = class InterUnitService {
    prisma;
    accountingService;
    constructor(prisma, accountingService) {
        this.prisma = prisma;
        this.accountingService = accountingService;
    }
    async generateReferenceNumber(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const prefix = `IU/${year}/${month}`;
        const lastTransaction = await this.prisma.interUnitTransaction.findFirst({
            where: { referenceNo: { startsWith: prefix } },
            orderBy: { referenceNo: 'desc' },
        });
        let sequence = 1;
        if (lastTransaction && lastTransaction.referenceNo) {
            const parts = lastTransaction.referenceNo.split('/');
            sequence = parseInt(parts[3]) + 1;
        }
        return `${prefix}/${String(sequence).padStart(4, '0')}`;
    }
    async create(dto, userId) {
        if (dto.sourceUnitId === dto.destUnitId) {
            throw new common_1.BadRequestException('Source and destination units must be different');
        }
        const referenceNo = await this.generateReferenceNumber(dto.transactionDate);
        return this.prisma.interUnitTransaction.create({
            data: {
                transactionDate: dto.transactionDate,
                sourceUnitId: dto.sourceUnitId,
                destUnitId: dto.destUnitId,
                amount: dto.amount,
                description: dto.description,
                transactionType: dto.transactionType,
                referenceNo,
                createdBy: userId,
                status: 'PENDING',
            },
            include: {
                creator: { select: { fullName: true } },
            },
        });
    }
    async findAll(filters) {
        const where = {};
        if (filters.startDate && filters.endDate) {
            where.transactionDate = {
                gte: filters.startDate,
                lte: filters.endDate,
            };
        }
        if (filters.sourceUnitId) {
            where.sourceUnitId = filters.sourceUnitId;
        }
        if (filters.destUnitId) {
            where.destUnitId = filters.destUnitId;
        }
        if (filters.status) {
            where.status = filters.status;
        }
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.interUnitTransaction.findMany({
                where,
                include: {
                    creator: { select: { fullName: true } },
                    approver: { select: { fullName: true } },
                },
                orderBy: { transactionDate: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.interUnitTransaction.count({ where }),
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
        const transaction = await this.prisma.interUnitTransaction.findUnique({
            where: { id },
            include: {
                creator: { select: { fullName: true, username: true } },
                approver: { select: { fullName: true, username: true } },
            },
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Inter-unit transaction not found');
        }
        return transaction;
    }
    async approve(id, userId) {
        const transaction = await this.findOne(id);
        if (transaction.status !== 'PENDING') {
            throw new common_1.BadRequestException('Only pending transactions can be approved');
        }
        return this.prisma.interUnitTransaction.update({
            where: { id },
            data: {
                status: 'APPROVED',
                approvedBy: userId,
            },
        });
    }
    async post(id, userId) {
        const transaction = await this.findOne(id);
        if (transaction.status !== 'APPROVED') {
            throw new common_1.BadRequestException('Transaction must be approved before posting');
        }
        if (transaction.journalId) {
            throw new common_1.BadRequestException('Transaction already posted');
        }
        const sourceKasAcc = await this.prisma.journalAccount.findFirst({
            where: { businessUnitId: transaction.sourceUnitId, accountCode: { startsWith: '1.01' } }
        });
        const sourceRakAcc = await this.prisma.journalAccount.findFirst({
            where: { businessUnitId: transaction.sourceUnitId, accountType: 'RAK' }
        });
        const destKasAcc = await this.prisma.journalAccount.findFirst({
            where: { businessUnitId: transaction.destUnitId, accountCode: { startsWith: '1.01' } }
        });
        const destRakAcc = await this.prisma.journalAccount.findFirst({
            where: { businessUnitId: transaction.destUnitId, accountType: 'RAK' }
        });
        if (!sourceKasAcc || !sourceRakAcc || !destKasAcc || !destRakAcc) {
            throw new common_1.BadRequestException('Akun Kas atau RAK untuk Unit Pengirim/Penerima tidak ditemukan. Pastikan COA sudah disetup dengan Business Unit ID yang benar.');
        }
        const journal = await this.accountingService.createManualJournal({
            date: transaction.transactionDate,
            description: `Mutasi Antar Unit: ${transaction.description || ''} (${transaction.referenceNo})`,
            userId: userId,
            postingType: 'AUTO',
            details: [
                {
                    accountCode: sourceRakAcc.accountCode,
                    debit: Number(transaction.amount),
                    credit: 0,
                    description: `Mutasi Keluar ke Unit ${transaction.destUnitId}`
                },
                {
                    accountCode: sourceKasAcc.accountCode,
                    debit: 0,
                    credit: Number(transaction.amount),
                    description: `Mutasi Keluar ke Unit ${transaction.destUnitId}`
                },
                {
                    accountCode: destKasAcc.accountCode,
                    debit: Number(transaction.amount),
                    credit: 0,
                    description: `Mutasi Masuk dari Unit ${transaction.sourceUnitId}`
                },
                {
                    accountCode: destRakAcc.accountCode,
                    debit: 0,
                    credit: Number(transaction.amount),
                    description: `Mutasi Masuk dari Unit ${transaction.sourceUnitId}`
                },
            ]
        });
        return this.prisma.interUnitTransaction.update({
            where: { id },
            data: {
                status: 'POSTED',
                journalId: journal.id
            },
        });
    }
    async getBalances(unitId, asOfDate) {
        const where = {
            status: 'POSTED',
            OR: [
                { sourceUnitId: unitId },
                { destUnitId: unitId },
            ],
        };
        if (asOfDate) {
            where.transactionDate = { lte: asOfDate };
        }
        const transactions = await this.prisma.interUnitTransaction.findMany({
            where,
            select: {
                sourceUnitId: true,
                destUnitId: true,
                amount: true,
            },
        });
        const balances = new Map();
        for (const txn of transactions) {
            if (txn.sourceUnitId === unitId) {
                const current = balances.get(txn.destUnitId) || 0;
                balances.set(txn.destUnitId, current + Number(txn.amount));
            }
            else if (txn.destUnitId === unitId) {
                const current = balances.get(txn.sourceUnitId) || 0;
                balances.set(txn.sourceUnitId, current - Number(txn.amount));
            }
        }
        return Array.from(balances.entries()).map(([otherUnitId, balance]) => ({
            unitId: otherUnitId,
            balance,
            type: balance > 0 ? 'RECEIVABLE' : 'PAYABLE',
        }));
    }
    async generateElimination(year, month, userId) {
        const existing = await this.prisma.interUnitElimination.findUnique({
            where: {
                periodYear_periodMonth: { periodYear: year, periodMonth: month },
            },
        });
        if (existing) {
            throw new common_1.BadRequestException(`Elimination already processed for ${year}-${String(month).padStart(2, '0')}`);
        }
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);
        const transactions = await this.prisma.interUnitTransaction.findMany({
            where: {
                status: 'POSTED',
                transactionDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });
        const totalEliminated = transactions.reduce((sum, txn) => sum + Number(txn.amount), 0);
        const elimination = await this.prisma.interUnitElimination.create({
            data: {
                periodYear: year,
                periodMonth: month,
                totalEliminated,
                processedDate: new Date(),
                processedBy: userId,
            },
        });
        await this.prisma.interUnitTransaction.updateMany({
            where: {
                id: { in: transactions.map(t => t.id) },
            },
            data: {
                status: 'ELIMINATED',
                eliminationJournalId: null,
            },
        });
        return elimination;
    }
    async delete(id) {
        const transaction = await this.findOne(id);
        if (transaction.status !== 'PENDING') {
            throw new common_1.BadRequestException('Only pending transactions can be deleted');
        }
        return this.prisma.interUnitTransaction.delete({
            where: { id },
        });
    }
};
exports.InterUnitService = InterUnitService;
exports.InterUnitService = InterUnitService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        accounting_service_1.AccountingService])
], InterUnitService);
//# sourceMappingURL=inter-unit.service.js.map