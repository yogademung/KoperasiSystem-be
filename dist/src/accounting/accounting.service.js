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
exports.AccountingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let AccountingService = class AccountingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAccounts(type, page = 1, limit = 10) {
        const where = { isActive: true };
        if (type) {
            where.accountType = type;
        }
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.journalAccount.findMany({
                where,
                orderBy: { accountCode: 'asc' },
                skip,
                take: limit,
            }),
            this.prisma.journalAccount.count({ where })
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }
    async getParentAccounts() {
        return this.prisma.journalAccount.findMany({
            where: {
                parentCode: null,
                isActive: true
            },
            orderBy: { accountCode: 'asc' }
        });
    }
    async generateNextCode(parentCode) {
        const parent = await this.prisma.journalAccount.findUnique({ where: { accountCode: parentCode } });
        if (!parent)
            throw new common_1.NotFoundException('Parent Account not found');
        const prefix = parentCode.substring(0, 5);
        const lastChild = await this.prisma.journalAccount.findFirst({
            where: {
                accountCode: {
                    startsWith: prefix,
                    not: parentCode
                },
                parentCode: parentCode
            },
            orderBy: { accountCode: 'desc' }
        });
        let nextSequence = 1;
        if (lastChild) {
            const parts = lastChild.accountCode.split('.');
            if (parts.length === 3) {
                nextSequence = parseInt(parts[2]) + 1;
            }
        }
        return `${prefix}${String(nextSequence).padStart(2, '0')}`;
    }
    async createAccount(data) {
        const existing = await this.prisma.journalAccount.findUnique({
            where: { accountCode: data.accountCode },
        });
        if (existing)
            throw new common_1.BadRequestException('Account Code already exists');
        return this.prisma.journalAccount.create({ data });
    }
    async updateAccount(code, data) {
        return this.prisma.journalAccount.update({
            where: { accountCode: code },
            data,
        });
    }
    async getMappings(module) {
        const where = {};
        if (module)
            where.module = module;
        return this.prisma.productCoaMapping.findMany({
            where,
            include: {
                debitRef: true,
                creditRef: true,
            },
            orderBy: { transType: 'asc' }
        });
    }
    async updateMapping(transType, debitAccount, creditAccount) {
        const debit = await this.prisma.journalAccount.findUnique({ where: { accountCode: debitAccount } });
        const credit = await this.prisma.journalAccount.findUnique({ where: { accountCode: creditAccount } });
        if (!debit || !credit)
            throw new common_1.BadRequestException('Invalid Debit or Credit Account Code');
        return this.prisma.productCoaMapping.update({
            where: { transType },
            data: {
                debitAccount,
                creditAccount
            }
        });
    }
    async generateJournalNumber(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const prefix = `JU/${year}/${month}`;
        const lastJournal = await this.prisma.postedJournal.findFirst({
            where: { journalNumber: { startsWith: prefix } },
            orderBy: { journalNumber: 'desc' },
        });
        let sequence = 1;
        if (lastJournal) {
            const parts = lastJournal.journalNumber.split('/');
            sequence = parseInt(parts[3]) + 1;
        }
        return `${prefix}/${String(sequence).padStart(4, '0')}`;
    }
    async validateJournalEntry(details) {
        let totalDebit = 0;
        let totalCredit = 0;
        for (const d of details) {
            totalDebit += Number(d.debit);
            totalCredit += Number(d.credit);
        }
        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            throw new common_1.BadRequestException(`Journal Unbalanced: Debit ${totalDebit} != Credit ${totalCredit}`);
        }
        return true;
    }
    async getJournals(params) {
        const where = {};
        if (params.startDate && params.endDate) {
            where.journalDate = {
                gte: params.startDate,
                lte: params.endDate,
            };
        }
        if (params.status) {
            where.status = params.status;
        }
        if (params.sourceCode) {
            where.sourceCode = params.sourceCode;
        }
        return this.prisma.postedJournal.findMany({
            where,
            include: {
                user: { select: { fullName: true } }
            },
            orderBy: { journalNumber: 'desc' }
        });
    }
    async getJournalDetail(id) {
        const journal = await this.prisma.postedJournal.findUnique({
            where: { id },
            include: {
                details: {
                    include: { account: true }
                },
                user: { select: { fullName: true } }
            }
        });
        if (!journal)
            throw new common_1.NotFoundException('Journal not found');
        return journal;
    }
    async createManualJournal(data) {
        await this.validateJournalEntry(data.details);
        const journalNo = await this.generateJournalNumber(data.date);
        return this.prisma.postedJournal.create({
            data: {
                journalNumber: journalNo,
                journalDate: data.date,
                description: data.description,
                postingType: 'MANUAL',
                userId: data.userId,
                status: 'POSTED',
                details: {
                    create: data.details.map(d => ({
                        accountCode: d.accountCode,
                        debit: d.debit,
                        credit: d.credit,
                        description: d.description || data.description
                    }))
                }
            }
        });
    }
    async updateManualJournal(id, data) {
        const existing = await this.prisma.postedJournal.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Journal not found');
        if (existing.postingType !== 'MANUAL')
            throw new common_1.BadRequestException('Only Manual Journals can be edited');
        await this.validateJournalEntry(data.details);
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.postedJournal.update({
                where: { id },
                data: {
                    journalDate: data.date,
                    description: data.description,
                    userId: data.userId,
                }
            });
            await tx.postedJournalDetail.deleteMany({
                where: { journalId: id }
            });
            await tx.postedJournalDetail.createMany({
                data: data.details.map(d => ({
                    journalId: id,
                    accountCode: d.accountCode,
                    debit: d.debit,
                    credit: d.credit,
                    description: d.description || data.description
                }))
            });
            return updated;
        });
    }
    async autoPostJournal(data) {
        const mapping = await this.prisma.productCoaMapping.findUnique({
            where: { transType: data.transType }
        });
        if (!mapping) {
            throw new Error(`COA Mapping not found for transaction type: ${data.transType}`);
        }
        const journalNo = await this.generateJournalNumber();
        return this.prisma.postedJournal.create({
            data: {
                journalNumber: journalNo,
                journalDate: new Date(),
                description: data.description || mapping.description,
                postingType: 'AUTO',
                transType: data.transType,
                sourceCode: data.transType.split('_')[0],
                refId: data.refId,
                userId: data.userId,
                wilayahCd: data.wilayahCd,
                status: 'POSTED',
                details: {
                    create: [
                        {
                            accountCode: mapping.debitAccount,
                            debit: data.amount,
                            credit: 0,
                            description: data.description
                        },
                        {
                            accountCode: mapping.creditAccount,
                            debit: 0,
                            credit: data.amount,
                            description: data.description
                        }
                    ]
                }
            }
        });
    }
};
exports.AccountingService = AccountingService;
exports.AccountingService = AccountingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AccountingService);
//# sourceMappingURL=accounting.service.js.map