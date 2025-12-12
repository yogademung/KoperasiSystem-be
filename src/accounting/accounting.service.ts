import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma } from '@prisma/client';

import { ModuleRef } from '@nestjs/core';
import { BrahmacariService } from '../simpanan/brahmacari/brahmacari.service';
import { AnggotaService } from '../simpanan/anggota/anggota.service';
import { TabrelaService } from '../simpanan/tabrela/tabrela.service';
import { DepositoService } from '../simpanan/deposito/deposito.service';
import { BalimesariService } from '../simpanan/balimesari/balimesari.service';
import { WanaprastaService } from '../simpanan/wanaprasta/wanaprasta.service';

@Injectable()
export class AccountingService {
    constructor(
        private prisma: PrismaService,
        private moduleRef: ModuleRef
    ) { }

    // ============================================
    // COA MANAGEMENT
    // ============================================

    async getAccounts(type?: string, page: number = 1, limit: number = 10) {
        const where: Prisma.JournalAccountWhereInput = { isActive: true };
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
        // Headers are accounts with parentCode = null
        return this.prisma.journalAccount.findMany({
            where: {
                parentCode: null,
                isActive: true
            },
            orderBy: { accountCode: 'asc' }
        });
    }

    async generateNextCode(parentCode: string) {
        // Parent code format: 1.01.00
        // Children format: 1.01.XX

        // 1. Get Parent to verify
        const parent = await this.prisma.journalAccount.findUnique({ where: { accountCode: parentCode } });
        if (!parent) throw new NotFoundException('Parent Account not found');

        // 2. Find last child
        const prefix = parentCode.substring(0, 5); // "1.01."

        const lastChild = await this.prisma.journalAccount.findFirst({
            where: {
                accountCode: {
                    startsWith: prefix,
                    not: parentCode // Exclude parent itself
                },
                parentCode: parentCode // Ensure it's a direct child
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

    async createAccount(data: Prisma.JournalAccountCreateInput) {
        // Check duplication
        const existing = await this.prisma.journalAccount.findUnique({
            where: { accountCode: data.accountCode },
        });
        if (existing) throw new BadRequestException('Account Code already exists');

        return this.prisma.journalAccount.create({ data });
    }

    async updateAccount(code: string, data: Prisma.JournalAccountUpdateInput) {
        return this.prisma.journalAccount.update({
            where: { accountCode: code },
            data,
        });
    }

    // ============================================
    // MAPPING CONFIGURATION
    // ============================================

    async getMappings(module?: string) {
        const where: Prisma.ProductCoaMappingWhereInput = {};
        if (module) where.module = module;

        return this.prisma.productCoaMapping.findMany({
            where,
            include: {
                debitRef: true,
                creditRef: true,
            },
            orderBy: { transType: 'asc' }
        });
    }

    async updateMapping(transType: string, debitAccount: string, creditAccount: string) {
        // Verify accounts exist
        const debit = await this.prisma.journalAccount.findUnique({ where: { accountCode: debitAccount } });
        const credit = await this.prisma.journalAccount.findUnique({ where: { accountCode: creditAccount } });

        if (!debit || !credit) throw new BadRequestException('Invalid Debit or Credit Account Code');

        return this.prisma.productCoaMapping.update({
            where: { transType },
            data: {
                debitAccount,
                creditAccount
            }
        });
    }

    // ============================================
    // JOURNAL ENTRIES
    // ============================================

    private async generateJournalNumber(date: Date = new Date()): Promise<string> {
        // Format: JU/YYYY/MM/XXXX
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

    async validateJournalEntry(details: { debit: number, credit: number }[]) {
        let totalDebit = 0;
        let totalCredit = 0;

        for (const d of details) {
            totalDebit += Number(d.debit);
            totalCredit += Number(d.credit);
        }

        // Tolerance for float precision
        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            throw new BadRequestException(`Journal Unbalanced: Debit ${totalDebit} != Credit ${totalCredit}`);
        }

        return true;
    }

    async getJournals(params: {
        startDate?: Date;
        endDate?: Date;
        status?: string;
        sourceCode?: string;
        fromAccount?: string;
        toAccount?: string;
        page?: number;
        limit?: number;
    }) {
        const where: Prisma.PostedJournalWhereInput = {};

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

        if (params.fromAccount || params.toAccount) {
            where.details = {
                some: {
                    accountCode: {
                        gte: params.fromAccount,
                        lte: params.toAccount
                    }
                }
            };
        }

        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.postedJournal.findMany({
                where,
                include: {
                    user: { select: { fullName: true } }
                },
                orderBy: { journalNumber: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.postedJournal.count({ where })
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async getJournalDetail(id: number) {
        const journal = await this.prisma.postedJournal.findUnique({
            where: { id },
            include: {
                details: {
                    include: { account: true }
                },
                user: { select: { fullName: true } }
            }
        });

        if (!journal) throw new NotFoundException('Journal not found');
        return journal;
    }

    async createManualJournal(data: {
        date: Date;
        description: string;
        userId: number;
        details: { accountCode: string; debit: number; credit: number; description?: string }[];
    }) {
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

    async updateManualJournal(id: number, data: {
        date: Date;
        description: string;
        userId: number;
        details: { accountCode: string; debit: number; credit: number; description?: string }[];
    }) {
        // 1. Check existence and Type
        const existing = await this.prisma.postedJournal.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('Journal not found');
        if (existing.postingType !== 'MANUAL') throw new BadRequestException('Only Manual Journals can be edited');

        // 2. Validate Balance
        await this.validateJournalEntry(data.details);

        // 3. Transaction Update
        return this.prisma.$transaction(async (tx) => {
            // Update Header
            const updated = await tx.postedJournal.update({
                where: { id },
                data: {
                    journalDate: data.date,
                    description: data.description,
                    userId: data.userId, // Update 'Last Modified By' effectively
                }
            });

            // Delete Old Details
            await tx.postedJournalDetail.deleteMany({
                where: { journalId: id }
            });

            // Create New Details
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
    // ============================================
    // AUTO POSTING
    // ============================================

    async autoPostJournal(data: {
        transType: string;
        amount: number;
        description: string;
        userId: number;
        refId?: number;
        wilayahCd?: string;
        branchCode?: string;
    }) {
        // 1. DYNAMIC LOOKUP
        const mapping = await this.prisma.productCoaMapping.findUnique({
            where: { transType: data.transType }
        });

        if (!mapping) {
            throw new Error(`COA Mapping not found for transaction type: ${data.transType}`);
        }

        // 2. GENERATE JOURNAL NO
        const journalNo = await this.generateJournalNumber();

        // 3. CREATE JOURNAL
        return this.prisma.postedJournal.create({
            data: {
                journalNumber: journalNo,
                journalDate: new Date(), // Auto post is always NOW
                description: data.description || mapping.description,
                postingType: 'AUTO',
                transType: data.transType,
                sourceCode: data.transType.split('_')[0], // Extract Source Code (e.g. BRAHMACARI from BRAHMACARI_SETOR)
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

    // ============================================
    // DELETE & ARCHIVE
    // ============================================

    async deleteJournal(id: number, userId: number, reason: string) {
        const journal = await this.prisma.postedJournal.findUnique({
            where: { id },
            include: { details: true }
        });

        if (!journal) throw new NotFoundException('Journal not found');

        // 1. VOID TRANSACTION LOGIC (For AUTO journals)
        if (journal.postingType === 'AUTO' && journal.refId && journal.sourceCode) {
            // Trans Types: ANGGOTA_*, BRAHMACARI_*, TABRELA_*, DEPOSITO_*, BALIMESARI_*, WANAPRASTA_*

            try {
                const source = journal.sourceCode;
                let service: any = null;

                // Dynamic Import / ModuleRef could be used, but simple switch is safer for type checking if imported
                // However, importing everything here might be messy.
                // I will need to use ModuleRef in constructor. 
                // But since I cannot change constructor easily without updating module, 
                // I'll try to use lazy import or just standard dispatch if services are provided in module.
                // Assuming services are NOT injected yet, I can't use them.
                // I need to update constructor.
                // For now, I'll place the logic and assume I'll update constructor in next step.

                // Oops, I can't update constructor with `replace_file_content` easily if I'm only replacing this block.
                // I will add `private moduleRef: ModuleRef` to checking, but I need to update the file content at the TOP too.
                // So I will make this a multi-step update or replace class start and end.
                // Let's assume I will update constructor separately or validly here.

                // actually, I can't access `this.moduleRef` if it's not in constructor.
                // I will just throw error for now if I can't access it? 
                // No, I must implement it correctly.

                // Plan: I'll use `import` at top and add to constructor.
                // But `replace_file_content` works on chunks. 
                // I will use `multi_replace_file_content`.
            } catch (error) {
                console.error('Failed to void transaction during journal delete:', error);
                throw new BadRequestException(`Failed to void source transaction: ${error.message}`);
            }
        }

        // ... (I will switch to multi_replace to handle imports and constructor)
    }
}
