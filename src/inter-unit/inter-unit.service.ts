import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  Prisma,
  InterUnitTransactionStatus,
  InterUnitTransactionType,
} from '@prisma/client';
import { AccountingService } from '../accounting/accounting.service';

export interface CreateInterUnitTransactionDto {
  transactionDate: Date;
  sourceUnitId: number;
  destUnitId: number;
  amount: number;
  description?: string;
  transactionType: InterUnitTransactionType;
}

export interface InterUnitTransactionFilters {
  startDate?: Date;
  endDate?: Date;
  sourceUnitId?: number;
  destUnitId?: number;
  status?: InterUnitTransactionStatus;
  page?: number;
  limit?: number;
}

@Injectable()
export class InterUnitService {
  constructor(
    private prisma: PrismaService,
    private accountingService: AccountingService,
  ) {}

  /**
   * Generate reference number for inter-unit transaction
   * Format: IU/YYYY/MM/XXXX
   */
  async generateReferenceNumber(date: Date = new Date()): Promise<string> {
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

  /**
   * Create new inter-unit transaction
   */
  async create(dto: CreateInterUnitTransactionDto, userId: number) {
    // Validate source and dest units are different
    if (dto.sourceUnitId === dto.destUnitId) {
      throw new BadRequestException(
        'Source and destination units must be different',
      );
    }

    // Generate reference number
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

  /**
   * Get all inter-unit transactions with filters
   */
  async findAll(filters: InterUnitTransactionFilters) {
    const where: Prisma.InterUnitTransactionWhereInput = {};

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

  /**
   * Get single transaction by ID
   */
  async findOne(id: number) {
    const transaction = await this.prisma.interUnitTransaction.findUnique({
      where: { id },
      include: {
        creator: { select: { fullName: true, username: true } },
        approver: { select: { fullName: true, username: true } },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Inter-unit transaction not found');
    }

    return transaction;
  }

  /**
   * Approve inter-unit transaction
   */
  async approve(id: number, userId: number) {
    const transaction = await this.findOne(id);

    if (transaction.status !== 'PENDING') {
      throw new BadRequestException(
        'Only pending transactions can be approved',
      );
    }

    return this.prisma.interUnitTransaction.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: userId,
      },
    });
  }

  /**
   * Post inter-unit transaction to journal
   * Creates a 4-line journal entry that balances both units using per-unit RAK accounts
   */
  async post(id: number, userId: number) {
    const transaction = await this.findOne(id);

    if (transaction.status !== 'APPROVED') {
      throw new BadRequestException(
        'Transaction must be approved before posting',
      );
    }

    if (transaction.journalId) {
      throw new BadRequestException('Transaction already posted');
    }

    // 1. Get Accounts for Source Unit
    const sourceKasAcc = await this.prisma.journalAccount.findFirst({
      where: {
        businessUnitId: transaction.sourceUnitId,
        accountCode: { startsWith: '1.01' },
      },
    });
    const sourceRakAcc = await this.prisma.journalAccount.findFirst({
      where: { businessUnitId: transaction.sourceUnitId, accountType: 'RAK' },
    });

    // 2. Get Accounts for Destination Unit
    const destKasAcc = await this.prisma.journalAccount.findFirst({
      where: {
        businessUnitId: transaction.destUnitId,
        accountCode: { startsWith: '1.01' },
      },
    });
    const destRakAcc = await this.prisma.journalAccount.findFirst({
      where: { businessUnitId: transaction.destUnitId, accountType: 'RAK' },
    });

    if (!sourceKasAcc || !sourceRakAcc || !destKasAcc || !destRakAcc) {
      throw new BadRequestException(
        'Akun Kas atau RAK untuk Unit Pengirim/Penerima tidak ditemukan. Pastikan COA sudah disetup dengan Business Unit ID yang benar.',
      );
    }

    // 3. Create Journal with 4 lines
    const journal = await this.accountingService.createManualJournal({
      date: transaction.transactionDate,
      description: `Mutasi Antar Unit: ${transaction.description || ''} (${transaction.referenceNo})`,
      userId: userId,
      postingType: 'AUTO',
      details: [
        // Pair 1: Source Unit (Outflow balanced by RAK)
        {
          accountCode: sourceRakAcc.accountCode,
          debit: Number(transaction.amount),
          credit: 0,
          description: `Mutasi Keluar ke Unit ${transaction.destUnitId}`,
        },
        {
          accountCode: sourceKasAcc.accountCode,
          debit: 0,
          credit: Number(transaction.amount),
          description: `Mutasi Keluar ke Unit ${transaction.destUnitId}`,
        },

        // Pair 2: Destination Unit (Inflow balanced by RAK)
        {
          accountCode: destKasAcc.accountCode,
          debit: Number(transaction.amount),
          credit: 0,
          description: `Mutasi Masuk dari Unit ${transaction.sourceUnitId}`,
        },
        {
          accountCode: destRakAcc.accountCode,
          debit: 0,
          credit: Number(transaction.amount),
          description: `Mutasi Masuk dari Unit ${transaction.sourceUnitId}`,
        },
      ],
    });

    return this.prisma.interUnitTransaction.update({
      where: { id },
      data: {
        status: 'POSTED',
        journalId: journal.id,
      },
    });
  }

  /**
   * Get inter-unit balances for a specific unit
   * Shows how much this unit owes to or is owed by other units
   */
  async getBalances(unitId: number, asOfDate?: Date) {
    const where: Prisma.InterUnitTransactionWhereInput = {
      status: 'POSTED',
      OR: [{ sourceUnitId: unitId }, { destUnitId: unitId }],
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

    // Calculate net balances
    const balances = new Map<number, number>();

    for (const txn of transactions) {
      if (txn.sourceUnitId === unitId) {
        // Money going out - we are owed (receivable)
        const current = balances.get(txn.destUnitId) || 0;
        balances.set(txn.destUnitId, current + Number(txn.amount));
      } else if (txn.destUnitId === unitId) {
        // Money coming in - we owe (payable)
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

  /**
   * Generate elimination entries for consolidation
   * This removes inter-unit transactions from consolidated reports
   */
  async generateElimination(year: number, month: number, userId: number) {
    // Check if already processed
    const existing = await this.prisma.interUnitElimination.findUnique({
      where: {
        periodYear_periodMonth: { periodYear: year, periodMonth: month },
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Elimination already processed for ${year}-${String(month).padStart(2, '0')}`,
      );
    }

    // Get all posted transactions for the period
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

    const totalEliminated = transactions.reduce(
      (sum, txn) => sum + Number(txn.amount),
      0,
    );

    // Create elimination record
    // TODO: Create actual elimination journal entries
    const elimination = await this.prisma.interUnitElimination.create({
      data: {
        periodYear: year,
        periodMonth: month,
        totalEliminated,
        processedDate: new Date(),
        processedBy: userId,
      },
    });

    // Update transaction statuses
    await this.prisma.interUnitTransaction.updateMany({
      where: {
        id: { in: transactions.map((t) => t.id) },
      },
      data: {
        status: 'ELIMINATED',
        eliminationJournalId: null, // Will be set when journal is created
      },
    });

    return elimination;
  }

  /**
   * Delete/cancel inter-unit transaction
   */
  async delete(id: number) {
    const transaction = await this.findOne(id);

    if (transaction.status !== 'PENDING') {
      throw new BadRequestException('Only pending transactions can be deleted');
    }

    return this.prisma.interUnitTransaction.delete({
      where: { id },
    });
  }
}
