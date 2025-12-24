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
        private moduleRef: ModuleRef,
        private anggotaService: AnggotaService,
        private tabrelaService: TabrelaService,
        private depositoService: DepositoService,
        private brahmacariService: BrahmacariService,
        private balimesariService: BalimesariService,
        private wanaprastaService: WanaprastaService
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

    async generateJournalNumber(date: Date = new Date()): Promise<string> {
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
        branchCode?: string;
        wilayahCd?: string;
    }, tx?: Prisma.TransactionClient) {
        const prisma = tx || this.prisma;
        // 1. DYNAMIC LOOKUP
        const mapping = await prisma.productCoaMapping.findUnique({
            where: { transType: data.transType }
        });

        if (!mapping) {
            throw new Error(`COA Mapping not found for transaction type: ${data.transType}`);
        }

        // 2. ENHANCE DESCRIPTION WITH ACCOUNT & SEQUENCE
        let detailedDescription = data.description || mapping.description;
        if (data.refId) {
            try {
                const info = await this.getTransactionInfo(data.transType, data.refId);
                if (info) {
                    detailedDescription += ` [Acct: ${info.accountNo} | #${info.sequence}]`;
                }
            } catch (err) {
                console.warn(`[Accounting] Failed to fetch transaction info for description: ${err.message}`);
            }
        }

        // 3. GENERATE JOURNAL NO
        const journalNo = await this.generateJournalNumber();

        // 4. CREATE JOURNAL
        return prisma.postedJournal.create({
            data: {
                journalNumber: journalNo,
                journalDate: new Date(), // Auto post is always NOW
                description: detailedDescription,
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
                            description: detailedDescription
                        },
                        {
                            accountCode: mapping.creditAccount,
                            debit: 0,
                            credit: data.amount,
                            description: detailedDescription
                        }
                    ]
                }
            }
        });
    }

    private async getTransactionInfo(transType: string, refId: number): Promise<{ accountNo: string, sequence: number } | null> {
        const source = transType.split('_')[0]; // ANGGOTA, TABRELA, etc.
        let accountNo = '';
        let sequence = 0;

        try {
            switch (source) {
                case 'ANGGOTA':
                    const tAnggota = await this.prisma.anggotaTransaction.findUnique({ where: { id: refId } });
                    if (!tAnggota) return null;
                    accountNo = tAnggota.accountNumber;
                    sequence = await this.prisma.anggotaTransaction.count({
                        where: { accountNumber: accountNo, id: { lte: refId } }
                    });
                    break;
                case 'TABRELA':
                    const tTab = await this.prisma.transTab.findUnique({ where: { id: refId } });
                    if (!tTab) return null;
                    accountNo = tTab.noTab;
                    sequence = await this.prisma.transTab.count({
                        where: { noTab: accountNo, id: { lte: refId } }
                    });
                    break;
                case 'DEPOSITO':
                    const tDep = await this.prisma.transJangka.findUnique({ where: { id: refId } });
                    if (!tDep) return null;
                    accountNo = tDep.noJangka;
                    sequence = await this.prisma.transJangka.count({
                        where: { noJangka: accountNo, id: { lte: refId } }
                    });
                    break;
                case 'BRAHMACARI':
                    const tBrah = await this.prisma.transBrahmacari.findUnique({ where: { id: refId } });
                    if (!tBrah) return null;
                    accountNo = tBrah.noBrahmacari;
                    sequence = await this.prisma.transBrahmacari.count({
                        where: { noBrahmacari: accountNo, id: { lte: refId } }
                    });
                    break;
                case 'BALIMESARI':
                    const tBali = await this.prisma.transBalimesari.findUnique({ where: { id: refId } });
                    if (!tBali) return null;
                    accountNo = tBali.noBalimesari;
                    sequence = await this.prisma.transBalimesari.count({
                        where: { noBalimesari: accountNo, id: { lte: refId } }
                    });
                    break;
                case 'WANAPRASTA':
                    const tWana = await this.prisma.transWanaprasta.findUnique({ where: { id: refId } });
                    if (!tWana) return null;
                    accountNo = tWana.noWanaprasta;
                    sequence = await this.prisma.transWanaprasta.count({
                        where: { noWanaprasta: accountNo, id: { lte: refId } }
                    });
                    break;
                case 'MODAL':
                    const tModal = await (this.prisma as any).transModal.findUnique({ where: { id: refId } });
                    if (!tModal) return null;
                    accountNo = tModal.noRekModal;
                    sequence = await (this.prisma as any).transModal.count({
                        where: { noRekModal: accountNo, id: { lte: refId } }
                    });
                    break;
                case 'LOAN':
                case 'PINJAMAN_LUAR':
                    const loan = await (this.prisma as any).externalLoan.findUnique({ where: { id: refId } });
                    if (!loan) return null;
                    accountNo = loan.contractNumber;
                    sequence = 1;
                    break;
                default:
                    return null;
            }
            return { accountNo, sequence };
        } catch (e) {
            console.error(`Error fetching transaction info for ${transType} #${refId}:`, e);
            return null;
        }
    }

    // ============================================
    // DELETE & ARCHIVE
    // ============================================

    async deleteJournal(id: number, userId: number, reason: string) {
        console.log(`[Accounting] Deleting Journal ID: ${id} by User: ${userId}`);

        return this.prisma.$transaction(async (tx) => {
            // 1. Get Journal with details (Using TX to lock/ensure consistency)
            const journal = await tx.postedJournal.findUnique({
                where: { id },
                include: { details: true }
            });

            if (!journal) throw new NotFoundException('Journal not found');

            // 2. VOID TRANSACTION LOGIC (For AUTO journals)
            if (journal.postingType === 'AUTO' && journal.refId && journal.sourceCode) {
                try {
                    console.log(`[Accounting] Voiding source transaction: ${journal.sourceCode} #${journal.refId}`);
                    // Determine Source Service based on sourceCode
                    switch (journal.sourceCode) {
                        case 'ANGGOTA':
                            if (this.anggotaService) await this.anggotaService.voidTransaction(journal.refId, tx);
                            break;
                        case 'TABRELA':
                            if (this.tabrelaService) await this.tabrelaService.voidTransaction(journal.refId, tx);
                            break;
                        case 'DEPOSITO':
                            if (this.depositoService) await this.depositoService.voidTransaction(journal.refId, tx);
                            break;
                        case 'BRAHMACARI':
                            if (this.brahmacariService) await this.brahmacariService.voidTransaction(journal.refId, tx);
                            break;
                        case 'BALIMESARI':
                            if (this.balimesariService) await this.balimesariService.voidTransaction(journal.refId, tx);
                            break;
                        case 'WANAPRASTA':
                            if (this.wanaprastaService) await this.wanaprastaService.voidTransaction(journal.refId, tx);
                            break;
                        default:
                            console.warn(`[Accounting] No void handler for sourceCode: ${journal.sourceCode}`);
                    }
                    // Future expansion...

                } catch (error) {
                    console.error('[Accounting] Failed to void transaction during journal delete:', error);
                    throw new BadRequestException(`Failed to void source transaction: ${error.message}`);
                }
            }

            // 3. ARCHIVE to Temp
            console.log('[Accounting] Archiving to PostedJournalTemp...');
            const temp = await tx.postedJournalTemp.create({
                data: {
                    originalId: journal.id,
                    journalNumber: journal.journalNumber,
                    journalDate: journal.journalDate,
                    description: journal.description,
                    postingType: journal.postingType,
                    transType: journal.transType || '',
                    sourceCode: journal.sourceCode,
                    refId: journal.refId,
                    userId: journal.userId,
                    wilayahCd: journal.wilayahCd,
                    status: 'DELETED',
                    deletedBy: userId.toString(),
                    deleteReason: reason
                }
            });

            // Create Details in Temp
            if (journal.details.length > 0) {
                await tx.postedJournalDetailTemp.createMany({
                    data: journal.details.map(d => ({
                        tempJournalId: temp.id,
                        accountCode: d.accountCode,
                        debit: d.debit,
                        credit: d.credit,
                        description: d.description
                    }))
                });
            }

            // 4. DELETE Original
            console.log('[Accounting] Deleting original Journal...');
            await tx.postedJournalDetail.deleteMany({ where: { journalId: id } });
            await tx.postedJournal.delete({ where: { id } });

            console.log('[Accounting] Delete Complete.');
            return { success: true, message: 'Journal deleted and associated transactions voided.' };
        });
    }
    async getDeletedJournals(params: {
        startDate?: Date;
        endDate?: Date;
        page?: number;
        limit?: number;
    }) {
        const where: Prisma.PostedJournalTempWhereInput = {};

        if (params.startDate && params.endDate) {
            where.deletedAt = {
                gte: params.startDate,
                lte: params.endDate,
            };
        }

        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.postedJournalTemp.findMany({
                where,
                orderBy: { deletedAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.postedJournalTemp.count({ where })
        ]);

        // Enrich with Deleted By User Name if possible
        const userIds = [...new Set(data.map(d => Number(d.deletedBy)).filter(id => !isNaN(id)))];
        const users = await this.prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, fullName: true, username: true }
        });

        const enrichedData = data.map(journal => {
            const deleterId = Number(journal.deletedBy);
            const deleter = users.find(u => u.id === deleterId);
            return {
                ...journal,
                deletedByName: deleter ? `${deleter.fullName} (${deleter.username})` : journal.deletedBy
            };
        });

        return {
            data: enrichedData,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }
    async getDailyReportData(date: Date) {
        // 1. Define Date Range (Full Day)
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // 2. Fetch Journals for the day
        const journals = await this.prisma.postedJournal.findMany({
            where: {
                journalDate: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            include: { details: true }
        });

        // 3. Aggregate Transaction Summaries (Setor/Tarik)
        // We need to group by Product (Source) and Type (Setor/Tarik)
        const products = ['ANGGOTA', 'TABRELA', 'DEPOSITO', 'BRAHMACARI', 'BALIMESARI', 'WANAPRASTA', 'KREDIT'];
        const summaryMap = new Map<string, {
            product: string;
            depositTotal: number;
            withdrawalTotal: number;
            depositCount: number;
            withdrawalCount: number;
        }>();

        // Initialize Map
        products.forEach(p => summaryMap.set(p, {
            product: p,
            depositTotal: 0,
            withdrawalTotal: 0,
            depositCount: 0,
            withdrawalCount: 0
        }));

        for (const j of journals) {
            if (!j.sourceCode || !summaryMap.has(j.sourceCode)) continue;

            const stats = summaryMap.get(j.sourceCode)!;

            // Logic to determine Setor vs Tarik
            // Usually 'SETOR' or 'TABUNG' indicates Inflow, 'TARIK' or 'CAIR' indicates Outflow.
            // We check transType string.
            const type = j.transType || '';
            const amount = j.details.reduce((sum, d) => sum + Number(d.debit), 0); // Total mutated amount (Debit = Credit in balanced journal)

            // Heuristic based on Naming Convention (e.g. TABRELA_SETOR vs TABRELA_TARIK)
            // KREDIT: ANGSURAN (In), REALISASI (Out)
            if (type.includes('SETOR') || type.includes('BUKA') || type.includes('TABUNG') || type.includes('ANGSURAN')) {
                stats.depositTotal += amount;
                stats.depositCount++;
            } else if (type.includes('TARIK') || type.includes('CAIR') || type.includes('TUTUP') || type.includes('REALISASI')) {
                stats.withdrawalTotal += amount;
                stats.withdrawalCount++;
            }
        }

        const summary = Array.from(summaryMap.values());

        // 4. Interest Estimation (Daily Accrual)
        // Formula: Sum(Saldo) * (AvgRate / 100) / 365
        const interestEstimates: { product: string; totalBalance: number; avgRate: number; estimatedDailyInterest: number }[] = [];

        // Helper for Interest Calc
        const calcInterest = async (model: any, name: string) => {
            const agg = await model.aggregate({
                _sum: { saldo: true },
                _avg: { interestRate: true }
            });
            const totalSaldo = Number(agg._sum.saldo || 0);
            const avgRate = Number(agg._avg.interestRate || 0);
            const dailyInterest = (totalSaldo * (avgRate / 100)) / 365;

            return {
                product: name,
                totalBalance: totalSaldo,
                avgRate: avgRate,
                estimatedDailyInterest: dailyInterest
            };
        };

        if (this.prisma.nasabahTab) interestEstimates.push(await calcInterest(this.prisma.nasabahTab, 'TABRELA'));
        if (this.prisma.nasabahBrahmacari) interestEstimates.push(await calcInterest(this.prisma.nasabahBrahmacari, 'BRAHMACARI'));
        if (this.prisma.nasabahBalimesari) interestEstimates.push(await calcInterest(this.prisma.nasabahBalimesari, 'BALIMESARI'));
        if (this.prisma.nasabahWanaprasta) interestEstimates.push(await calcInterest(this.prisma.nasabahWanaprasta, 'WANAPRASTA'));
        // Deposito usually has fixed monthly, but we can est daily
        if (this.prisma.nasabahJangka) {
            const agg = await this.prisma.nasabahJangka.aggregate({
                _sum: { nominal: true }, // Deposito uses 'nominal' as principal
                _avg: { bunga: true }
            });
            const totalSaldo = Number(agg._sum.nominal || 0);
            const avgRate = Number(agg._avg.bunga || 0);
            const dailyInterest = (totalSaldo * (avgRate / 100)) / 365;
            interestEstimates.push({
                product: 'DEPOSITO',
                totalBalance: totalSaldo,
                avgRate: avgRate,
                estimatedDailyInterest: dailyInterest
            });
        }

        return {
            date: date,
            summary,
            interestEstimates,
            journals // Also return the raw journals for the list view
        };
    }
}
