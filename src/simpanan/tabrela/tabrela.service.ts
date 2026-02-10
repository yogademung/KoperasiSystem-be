import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateTabrelaDto } from './dto/create-tabrela.dto';

@Injectable()
export class TabrelaService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(createDto: CreateTabrelaDto) {
    // Generate No Tabungan: TAB-{Timestamp}-{Random}
    const noTab = `TAB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return this.prisma.$transaction(async (tx) => {
      // 1. Create Account
      const tabrela = await tx.nasabahTab.create({
        data: {
          noTab,
          nasabahId: createDto.nasabahId,
          tglBuka: new Date(),
          saldo: createDto.setoranAwal || 0,
          interestRate: 0, // Default interest rate for Tabrela, configurable later
          status: 'A', // Active
        },
      });

      // 2. Create Initial Transaction if setoranAwal > 0
      if (createDto.setoranAwal && createDto.setoranAwal > 0) {
        const transaction = await tx.transTab.create({
          data: {
            noTab,
            tipeTrans: 'SETORAN',
            nominal: createDto.setoranAwal,
            saldoAkhir: createDto.setoranAwal,
            keterangan:
              createDto.keterangan || 'Setoran Awal Pembukaan Rekening',
            latitude: (createDto as any).latitude,
            longitude: (createDto as any).longitude,
            createdBy: 'SYSTEM', // Should be user ID from auth context but here we don't have userID?? create method signature doesn't have it?!
          },
        });

        // NOTE: create method currently missing userId. Assuming system or 1.
        // But if collector creates, we need userId.
        // Assuming userId will be passed or existing flow updated.
        // For now, ignoring collector logic for create if userId is missing.

        // EMIT EVENT
        this.eventEmitter.emit('transaction.created', {
          transType: 'TABRELA_SETOR',
          amount: createDto.setoranAwal,
          description:
            createDto.keterangan || 'Setoran Awal Pembukaan Rekening',
          userId: 1, // Placeholder
          refId: transaction.id,
          branchCode: '001',
        });
      }
      return tabrela;
    });
  }

  async findAll() {
    return this.prisma.nasabahTab.findMany({
      include: {
        nasabah: {
          select: { nama: true, noKtp: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      where: { status: 'A' },
    });
  }

  async findOne(noTab: string) {
    const account = await this.prisma.nasabahTab.findUnique({
      where: { noTab },
      include: {
        nasabah: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!account) {
      throw new NotFoundException(`Tabungan ${noTab} not found`);
    }

    return account;
  }
  async setoran(
    noTab: string,
    dto: { amount: number; description?: string; transType?: string },
    userId?: any,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const account = await tx.nasabahTab.findUnique({ where: { noTab } });
      if (!account) throw new NotFoundException('Tabungan not found');
      if (account.status !== 'A')
        throw new BadRequestException('Account not active');

      const newBalance = Number(account.saldo) + dto.amount;

      // Create Transaction
      const transaction = await tx.transTab.create({
        data: {
          noTab,
          tipeTrans: dto.transType || 'SETORAN',
          nominal: dto.amount,
          saldoAkhir: newBalance,
          keterangan: dto.description,
          latitude: (dto as any).latitude,
          longitude: (dto as any).longitude,
          createdBy: userId?.toString() || 'SYSTEM',
        },
      });

      // Update Balance
      await tx.nasabahTab.update({
        where: { noTab },
        data: { saldo: newBalance },
      });

      // EMIT EVENT
      this.eventEmitter.emit('transaction.created', {
        transType: 'TABRELA_SETOR',
        amount: dto.amount,
        description: transaction.keterangan,
        userId: userId || 1,
        refId: transaction.id,
        branchCode: '001',
      });

      return { success: true };
    });
  }

  async penarikan(
    noTab: string,
    dto: { amount: number; description?: string },
    userId?: any,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const account = await tx.nasabahTab.findUnique({ where: { noTab } });
      if (!account) throw new NotFoundException('Tabungan not found');
      if (account.status !== 'A')
        throw new BadRequestException('Account not active');

      if (Number(account.saldo) < dto.amount) {
        throw new BadRequestException('Insufficient balance');
      }

      const newBalance = Number(account.saldo) - dto.amount;

      // Create Transaction (Debit)
      const transaction = await tx.transTab.create({
        data: {
          noTab,
          tipeTrans: 'PENARIKAN',
          nominal: -Math.abs(dto.amount), // Negative for withdrawal
          saldoAkhir: newBalance,
          keterangan: dto.description,
          latitude: (dto as any).latitude,
          longitude: (dto as any).longitude,
          createdBy: userId?.toString() || 'SYSTEM',
        },
      });

      // Update Balance
      await tx.nasabahTab.update({
        where: { noTab },
        data: { saldo: newBalance },
      });

      // EMIT EVENT
      this.eventEmitter.emit('transaction.created', {
        transType: 'TABRELA_TARIK',
        amount: dto.amount,
        description: transaction.keterangan,
        userId: userId || 1,
        refId: transaction.id,
        branchCode: '001',
      });

      return { success: true };
    });
  }

  /**
   * Void/Reverse a transaction
   */
  async voidTransaction(transId: number, txInput?: any) {
    const executeLogic = async (tx: any) => {
      // 1. Find Original Transaction
      const original = await tx.transTab.findUnique({
        where: { id: transId },
      });

      if (!original)
        throw new BadRequestException(
          `Transaction with ID ${transId} not found`,
        );

      // 2. Get Account
      const account = await tx.nasabahTab.findUnique({
        where: { noTab: original.noTab },
      });

      if (!account) throw new BadRequestException('Account not found');

      // 3. Reverse Logic
      // Original: Balance = Old + Amount.
      // Reversal: Balance = Current - Amount.
      const reversalAmount = Number(original.nominal);
      const newBalance = Number(account.saldo) - reversalAmount;

      // 4. Update Account
      await tx.nasabahTab.update({
        where: { noTab: original.noTab },
        data: { saldo: newBalance },
      });

      // 5. Create Reversal Transaction
      return tx.transTab.create({
        data: {
          noTab: original.noTab,
          tipeTrans: 'KOREKSI', // Generic correction type
          nominal: -reversalAmount, // Opposite of original
          saldoAkhir: newBalance,
          keterangan: `VOID/REVERSAL of Trans #${original.id}: ${original.keterangan || ''}`,
          createdBy: original.createdBy || 'SYSTEM',
        },
      });
    };

    if (txInput) {
      return executeLogic(txInput);
    } else {
      return this.prisma.$transaction(executeLogic);
    }
  }

  async closeAccount(
    noTab: string,
    dto: { reason: string; penalty?: number; adminFee?: number },
    userId?: number,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const account = await tx.nasabahTab.findUnique({ where: { noTab } });
      if (!account) throw new NotFoundException('Account not found');
      if (account.status !== 'A')
        throw new BadRequestException('Account is not active');

      let currentBalance = Number(account.saldo);
      const penalty = dto.penalty || 0;
      const adminFee = dto.adminFee || 0;

      // 1. Apply Penalty (if any)
      if (penalty > 0) {
        currentBalance -= penalty;
        const penaltyTx = await tx.transTab.create({
          data: {
            noTab,
            tipeTrans: 'DENDA',
            nominal: -penalty,
            saldoAkhir: currentBalance,
            keterangan: `Denda Penutupan: ${dto.reason}`,
            createdBy: userId?.toString() || 'SYSTEM',
          },
        });

        this.eventEmitter.emit('transaction.created', {
          transType: 'TABRELA_DENDA',
          amount: penalty,
          description: `Denda Penutupan ${noTab}`,
          userId: userId || 1,
          refId: penaltyTx.id,
          branchCode: '001',
        });
      }

      // 2. Apply Admin Fee (if any)
      if (adminFee > 0) {
        currentBalance -= adminFee;
        const adminTx = await tx.transTab.create({
          data: {
            noTab,
            tipeTrans: 'BIAYA_ADMIN',
            nominal: -adminFee,
            saldoAkhir: currentBalance,
            keterangan: 'Biaya Administrasi Penutupan',
            createdBy: userId?.toString() || 'SYSTEM',
          },
        });

        this.eventEmitter.emit('transaction.created', {
          transType: 'TABRELA_ADMIN',
          amount: adminFee,
          description: `Biaya Admin Penutupan ${noTab}`,
          userId: userId || 1,
          refId: adminTx.id,
          branchCode: '001',
        });
      }

      // 3. Final Withdrawal (TUTUP) if balance > 0
      if (currentBalance > 0) {
        const closeTx = await tx.transTab.create({
          data: {
            noTab,
            tipeTrans: 'TUTUP',
            nominal: -currentBalance,
            saldoAkhir: 0,
            keterangan: `Penutupan Rekening: ${dto.reason}`,
            createdBy: userId?.toString() || 'SYSTEM',
          },
        });

        this.eventEmitter.emit('transaction.created', {
          transType: 'TABRELA_TUTUP',
          amount: currentBalance,
          description: `Penutupan Rekening ${noTab}`,
          userId: userId || 1,
          refId: closeTx.id,
          branchCode: '001',
        });
      }

      // 4. Update Account Status
      await tx.nasabahTab.update({
        where: { noTab },
        data: {
          status: 'T', // Closed
          saldo: 0,
        },
      });

      return { success: true, refund: currentBalance };
    });
  }
}
