import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateBrahmacariDto } from './dto/create-brahmacari.dto';
import { BrahmacariTransactionDto } from './dto/transaction.dto';

@Injectable()
export class BrahmacariService {
    constructor(
        private prisma: PrismaService,
        private eventEmitter: EventEmitter2
    ) { }

    /**
     * Create new Brahmacari account
     * Brahmacari is a student savings account with higher interest rate
     */
    async create(createDto: CreateBrahmacariDto) {
        // Generate account number: BRA-{timestamp}-{random}
        const noBrahmacari = `BRA-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        return this.prisma.$transaction(async (tx) => {
            // 1. Create Account
            const brahmacari = await tx.nasabahBrahmacari.create({
                data: {
                    noBrahmacari,
                    nasabahId: createDto.nasabahId,
                    tglBuka: new Date(),
                    saldo: createDto.setoranAwal || 0,
                    interestRate: 3.5, // Default higher interest rate for students (3.5%)
                    status: 'A', // Active
                }
            });

            // 2. Create Initial Transaction if setoranAwal > 0
            if (createDto.setoranAwal && createDto.setoranAwal > 0) {
                const transaction = await tx.transBrahmacari.create({
                    data: {
                        noBrahmacari,
                        tipeTrans: 'SETORAN',
                        nominal: createDto.setoranAwal,
                        saldoAkhir: createDto.setoranAwal,
                        keterangan: createDto.keterangan || 'Setoran Awal Pembukaan Rekening Brahmacari',
                        createdBy: 'SYSTEM'
                    }
                });

                // EMIT EVENT
                try {
                    this.eventEmitter.emit('transaction.created', {
                        transType: 'BRAHMACARI_SETOR',
                        amount: createDto.setoranAwal,
                        description: createDto.keterangan || 'Setoran Awal Pembukaan Rekening Brahmacari',
                        userId: 1,
                        refId: transaction.id,
                        branchCode: '001'
                    });
                } catch (error) {
                    console.error('Failed to emit transaction event:', error);
                }
            }

            return brahmacari;
        });
    }

    /**
     * Get all Brahmacari accounts
     */
    async findAll() {
        return this.prisma.nasabahBrahmacari.findMany({
            include: {
                nasabah: {
                    select: { nama: true, noKtp: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Get Brahmacari account detail with transactions
     */
    async findOne(noBrahmacari: string) {
        const account = await this.prisma.nasabahBrahmacari.findUnique({
            where: { noBrahmacari },
            include: {
                nasabah: true,
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 20
                }
            }
        });

        if (!account) {
            throw new NotFoundException('Rekening Brahmacari tidak ditemukan');
        }

        return account;
    }

    /**
     * Deposit transaction
     */
    async setoran(noBrahmacari: string, dto: BrahmacariTransactionDto, userId: number) {
        return this.prisma.$transaction(async (tx) => {
            // Get current account
            const account = await tx.nasabahBrahmacari.findUnique({
                where: { noBrahmacari }
            });

            if (!account) {
                throw new NotFoundException('Rekening tidak ditemukan');
            }

            if (account.status !== 'A') {
                throw new BadRequestException('Rekening tidak aktif');
            }

            // Calculate new balance
            const newBalance = Number(account.saldo) + dto.nominal;

            // Create transaction
            const transaction = await tx.transBrahmacari.create({
                data: {
                    noBrahmacari,
                    tipeTrans: 'SETORAN',
                    nominal: dto.nominal,
                    saldoAkhir: newBalance,
                    keterangan: dto.keterangan || 'Setoran Brahmacari',
                    createdBy: userId?.toString() || 'SYSTEM'
                }
            });

            // Update account balance
            await tx.nasabahBrahmacari.update({
                where: { noBrahmacari },
                data: { saldo: newBalance }
            });

            // EMIT EVENT
            try {
                this.eventEmitter.emit('transaction.created', {
                    transType: 'BRAHMACARI_SETOR',
                    amount: dto.nominal,
                    description: transaction.keterangan,
                    userId: userId || 1,
                    refId: transaction.id,
                    branchCode: '001'
                });
            } catch (error) {
                console.error('Failed to emit transaction event:', error);
            }

            return transaction;
        });
    }

    /**
     * Withdrawal transaction
     */
    async penarikan(noBrahmacari: string, dto: BrahmacariTransactionDto, userId: number) {
        return this.prisma.$transaction(async (tx) => {
            // Get current account
            const account = await tx.nasabahBrahmacari.findUnique({
                where: { noBrahmacari }
            });

            if (!account) {
                throw new NotFoundException('Rekening tidak ditemukan');
            }

            if (account.status !== 'A') {
                throw new BadRequestException('Rekening tidak aktif');
            }

            // Check sufficient balance
            if (Number(account.saldo) < dto.nominal) {
                throw new BadRequestException('Saldo tidak mencukupi');
            }

            // Calculate new balance
            const newBalance = Number(account.saldo) - dto.nominal;

            // Create transaction
            const transaction = await tx.transBrahmacari.create({
                data: {
                    noBrahmacari,
                    tipeTrans: 'PENARIKAN',
                    nominal: dto.nominal,
                    saldoAkhir: newBalance,
                    keterangan: dto.keterangan || 'Penarikan Brahmacari',
                    createdBy: userId?.toString() || 'SYSTEM'
                }
            });

            // Update account balance
            await tx.nasabahBrahmacari.update({
                where: { noBrahmacari },
                data: { saldo: newBalance }
            });

            // EMIT EVENT
            try {
                this.eventEmitter.emit('transaction.created', {
                    transType: 'BRAHMACARI_TARIK',
                    amount: dto.nominal,
                    description: transaction.keterangan,
                    userId: userId || 1,
                    refId: transaction.id,
                    branchCode: '001'
                });
            } catch (error) {
                console.error('Failed to emit transaction event:', error);
            }

            return transaction;
        });
    }

    /**
     * Get transactions with pagination
     */
    async getTransactions(noBrahmacari: string, page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const [transactions, total] = await Promise.all([
            this.prisma.transBrahmacari.findMany({
                where: { noBrahmacari },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            this.prisma.transBrahmacari.count({
                where: { noBrahmacari }
            })
        ]);

        return {
            data: transactions,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    /**
     * Void/Reverse a transaction
     * Called when a Journal is deleted
     */
    async voidTransaction(transId: number, txInput?: any) {
        const executeLogic = async (tx: any) => {
            // 1. Find Original Transaction
            const original = await tx.transBrahmacari.findUnique({
                where: { id: transId }
            });

            if (!original) throw new NotFoundException(`Transaction with ID ${transId} not found`);

            // 2. Get Account
            const account = await tx.nasabahBrahmacari.findUnique({
                where: { noBrahmacari: original.noBrahmacari }
            });

            if (!account) throw new NotFoundException('Account not found');

            // 3. Determine Reversal Logic
            let newBalance = Number(account.saldo);
            const nominal = Number(original.nominal);
            let reversalAmount = 0;

            // In Brahmacari, nominal seems to be stored as positive usually.
            // Check Transaction Type or infer from impact?
            // If SETORAN, it added to balance. So we subtract.
            if (['SETORAN', 'BRAHMACARI_SETOR', 'BUNGA'].includes(original.tipeTrans)) {
                newBalance -= nominal;
                reversalAmount = -nominal; // Negative for correction
            } else if (['PENARIKAN', 'BRAHMACARI_TARIK', 'ADMIN_FEE', 'PAJAK'].includes(original.tipeTrans)) {
                newBalance += nominal;
                reversalAmount = nominal; // Positive for correction
            } else {
                // Fallback or generic rule. 
                // If original.nominal was negative? Schema allows Decimal.
                // If types are unknown, maybe assumes standard signed?
                // Let's assume SETORAN is default positive impact.
                newBalance -= nominal;
                reversalAmount = -nominal;
            }

            // 4. Update Balance
            await tx.nasabahBrahmacari.update({
                where: { noBrahmacari: original.noBrahmacari },
                data: { saldo: newBalance }
            });

            // 5. Create Reversal Transaction
            return tx.transBrahmacari.create({
                data: {
                    noBrahmacari: original.noBrahmacari,
                    tipeTrans: 'KOREKSI',
                    nominal: reversalAmount, // Signed amount for correction ?? Or should it be positive with KOREKSI type?
                    // To stay consistent with Tabrela's void, using signed nominal is clearer for "Net Change".
                    // But if this table expects positive, this might look weird.
                    // Let's stick to signed for KOREKSI to indicate direction explicitly.
                    saldoAkhir: newBalance,
                    keterangan: `VOID/REVERSAL of Trans #${original.id}: ${original.keterangan}`,
                    createdBy: 'SYSTEM'
                }
            });
        };

        if (txInput) {
            return executeLogic(txInput);
        } else {
            return this.prisma.$transaction(executeLogic);
        }
    }

    /**
     * Close Account
     */
    async closeAccount(noBrahmacari: string, dto: { reason: string, penalty?: number, adminFee?: number }, userId: number) {
        const { reason, penalty = 0, adminFee = 0 } = dto;

        return this.prisma.$transaction(async (tx) => {
            const account = await tx.nasabahBrahmacari.findUnique({ where: { noBrahmacari } });
            if (!account) throw new NotFoundException('Account not found');
            if (account.status !== 'A') throw new BadRequestException('Account is not active');

            let currentBalance = Number(account.saldo);

            // 1. Apply Penalty (if any)
            if (penalty > 0) {
                currentBalance -= penalty;
                await tx.transBrahmacari.create({
                    data: {
                        noBrahmacari,
                        tipeTrans: 'DENDA',
                        nominal: -penalty,
                        saldoAkhir: currentBalance,
                        keterangan: `Denda Penutupan: ${reason}`,
                        createdBy: userId?.toString() || 'SYSTEM'
                    }
                });
            }

            // 2. Apply Admin Fee (if any)
            if (adminFee > 0) {
                currentBalance -= adminFee;
                await tx.transBrahmacari.create({
                    data: {
                        noBrahmacari,
                        tipeTrans: 'BIAYA_ADMIN',
                        nominal: -adminFee,
                        saldoAkhir: currentBalance,
                        keterangan: 'Biaya Administrasi Penutupan',
                        createdBy: userId?.toString() || 'SYSTEM'
                    }
                });
            }

            // 3. Final Withdrawal (TUTUP) if balance > 0
            if (currentBalance > 0) {
                const closeTx = await tx.transBrahmacari.create({
                    data: {
                        noBrahmacari,
                        tipeTrans: 'TUTUP',
                        nominal: -currentBalance,
                        saldoAkhir: 0,
                        keterangan: `Penutupan Rekening: ${reason}`,
                        createdBy: userId?.toString() || 'SYSTEM'
                    }
                });

                // Emit event
                this.eventEmitter.emit('transaction.created', {
                    transType: 'BRAHMACARI_TUTUP',
                    amount: currentBalance,
                    description: `Penutupan Rekening ${noBrahmacari}`,
                    userId: userId || 1,
                    refId: closeTx.id,
                    branchCode: '001'
                });
            }

            // 4. Update Account Status
            await tx.nasabahBrahmacari.update({
                where: { noBrahmacari },
                data: {
                    status: 'T', // Closed
                    saldo: 0
                }
            });

            return { success: true, refund: currentBalance };
        });
    }
}
