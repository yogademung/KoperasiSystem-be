import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateWanaprastaDto } from './dto/create-wanaprasta.dto';
import { WanaprastaTransactionDto } from './dto/transaction.dto';

@Injectable()
export class WanaprastaService {
    constructor(
        private prisma: PrismaService,
        private eventEmitter: EventEmitter2
    ) { }

    /**
     * Create new Wanaprasta account
     * Wanaprasta is a retirement savings account with highest interest rate for long-term savings
     */
    async create(createDto: CreateWanaprastaDto) {
        // Generate account number: WNP-{timestamp}-{random}
        const noWanaprasta = `WNP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        return this.prisma.$transaction(async (tx) => {
            // 1. Create Account
            const wanaprasta = await tx.nasabahWanaprasta.create({
                data: {
                    noWanaprasta,
                    nasabahId: createDto.nasabahId,
                    tglBuka: new Date(),
                    saldo: createDto.setoranAwal || 0,
                    interestRate: 4.0, // Highest interest rate for retirement (4.0%)
                    status: 'A', // Active
                }
            });

            // 2. Create Initial Transaction if setoranAwal > 0
            if (createDto.setoranAwal && createDto.setoranAwal > 0) {
                const transaction = await tx.transWanaprasta.create({
                    data: {
                        noWanaprasta,
                        tipeTrans: 'SETORAN',
                        nominal: createDto.setoranAwal,
                        saldoAkhir: createDto.setoranAwal,
                        keterangan: createDto.keterangan || 'Setoran Awal Pembukaan Rekening Wanaprasta',
                        createdBy: 'SYSTEM'
                    }
                });

                // EMIT EVENT
                try {
                    this.eventEmitter.emit('transaction.created', {
                        transType: 'WANAPRASTA_SETOR',
                        amount: createDto.setoranAwal,
                        description: createDto.keterangan || 'Setoran Awal Pembukaan Rekening Wanaprasta',
                        userId: 1,
                        refId: transaction.id,
                        branchCode: '001'
                    });
                } catch (error) {
                    console.error('Failed to emit transaction event:', error);
                }
            }

            return wanaprasta;
        });
    }

    async findAll() {
        return this.prisma.nasabahWanaprasta.findMany({
            include: {
                nasabah: {
                    select: { nama: true, noKtp: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOne(noWanaprasta: string) {
        const account = await this.prisma.nasabahWanaprasta.findUnique({
            where: { noWanaprasta },
            include: {
                nasabah: true,
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 20
                }
            }
        });

        if (!account) {
            throw new NotFoundException('Rekening Wanaprasta tidak ditemukan');
        }

        return account;
    }

    async setoran(noWanaprasta: string, dto: WanaprastaTransactionDto, userId: number) {
        return this.prisma.$transaction(async (tx) => {
            const account = await tx.nasabahWanaprasta.findUnique({
                where: { noWanaprasta }
            });

            if (!account) {
                throw new NotFoundException('Rekening tidak ditemukan');
            }

            if (account.status !== 'A') {
                throw new BadRequestException('Rekening tidak aktif');
            }

            const newBalance = Number(account.saldo) + dto.nominal;

            const transaction = await tx.transWanaprasta.create({
                data: {
                    noWanaprasta,
                    tipeTrans: 'SETORAN',
                    nominal: dto.nominal,
                    saldoAkhir: newBalance,
                    keterangan: dto.keterangan || 'Setoran Wanaprasta',
                    createdBy: userId?.toString() || 'SYSTEM'
                }
            });

            await tx.nasabahWanaprasta.update({
                where: { noWanaprasta },
                data: { saldo: newBalance }
            });

            // EMIT EVENT
            try {
                this.eventEmitter.emit('transaction.created', {
                    transType: 'WANAPRASTA_SETOR',
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

    async penarikan(noWanaprasta: string, dto: WanaprastaTransactionDto, userId: number) {
        return this.prisma.$transaction(async (tx) => {
            const account = await tx.nasabahWanaprasta.findUnique({
                where: { noWanaprasta }
            });

            if (!account) {
                throw new NotFoundException('Rekening tidak ditemukan');
            }

            if (account.status !== 'A') {
                throw new BadRequestException('Rekening tidak aktif');
            }

            if (Number(account.saldo) < dto.nominal) {
                throw new BadRequestException('Saldo tidak mencukupi');
            }

            const newBalance = Number(account.saldo) - dto.nominal;

            const transaction = await tx.transWanaprasta.create({
                data: {
                    noWanaprasta,
                    tipeTrans: 'PENARIKAN',
                    nominal: dto.nominal,
                    saldoAkhir: newBalance,
                    keterangan: dto.keterangan || 'Penarikan Wanaprasta',
                    createdBy: userId?.toString() || 'SYSTEM'
                }
            });

            await tx.nasabahWanaprasta.update({
                where: { noWanaprasta },
                data: { saldo: newBalance }
            });

            // EMIT EVENT
            try {
                this.eventEmitter.emit('transaction.created', {
                    transType: 'WANAPRASTA_TARIK',
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

    async getTransactions(noWanaprasta: string, page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const [transactions, total] = await Promise.all([
            this.prisma.transWanaprasta.findMany({
                where: { noWanaprasta },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            this.prisma.transWanaprasta.count({
                where: { noWanaprasta }
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

    async voidTransaction(transId: number, txInput?: any) {
        const executeLogic = async (tx: any) => {
            const original = await tx.transWanaprasta.findUnique({ where: { id: transId } });
            if (!original) throw new NotFoundException(`Transaction ${transId} not found`);

            const account = await tx.nasabahWanaprasta.findUnique({ where: { noWanaprasta: original.noWanaprasta } });
            if (!account) throw new NotFoundException('Account not found');

            let newBalance = Number(account.saldo);
            const nominal = Number(original.nominal);
            let reversalAmount = 0;

            if (original.tipeTrans === 'SETORAN' || original.tipeTrans === 'WANAPRASTA_SETOR') {
                newBalance -= nominal;
                reversalAmount = -nominal;
            } else if (original.tipeTrans === 'PENARIKAN' || original.tipeTrans === 'WANAPRASTA_TARIK') {
                newBalance += nominal;
                reversalAmount = nominal;
            } else {
                newBalance -= nominal;
                reversalAmount = -nominal;
            }

            await tx.nasabahWanaprasta.update({
                where: { noWanaprasta: original.noWanaprasta },
                data: { saldo: newBalance }
            });

            return tx.transWanaprasta.create({
                data: {
                    noWanaprasta: original.noWanaprasta,
                    tipeTrans: 'KOREKSI',
                    nominal: reversalAmount,
                    saldoAkhir: newBalance,
                    keterangan: `VOID Trans #${original.id}: ${original.keterangan}`,
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
    async closeAccount(noWanaprasta: string, dto: { reason: string, penalty?: number, adminFee?: number }, userId: number) {
        const { reason, penalty = 0, adminFee = 0 } = dto;

        return this.prisma.$transaction(async (tx) => {
            const account = await tx.nasabahWanaprasta.findUnique({ where: { noWanaprasta } });
            if (!account) throw new NotFoundException('Account not found');
            if (account.status !== 'A') throw new BadRequestException('Account is not active');

            let currentBalance = Number(account.saldo);

            // 1. Apply Penalty (if any)
            if (penalty > 0) {
                currentBalance -= penalty;
                await tx.transWanaprasta.create({
                    data: {
                        noWanaprasta,
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
                await tx.transWanaprasta.create({
                    data: {
                        noWanaprasta,
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
                const closeTx = await tx.transWanaprasta.create({
                    data: {
                        noWanaprasta,
                        tipeTrans: 'TUTUP',
                        nominal: -currentBalance,
                        saldoAkhir: 0,
                        keterangan: `Penutupan Rekening: ${reason}`,
                        createdBy: userId?.toString() || 'SYSTEM'
                    }
                });

                this.eventEmitter.emit('transaction.created', {
                    transType: 'WANAPRASTA_TUTUP',
                    amount: currentBalance,
                    description: `Penutupan Rekening ${noWanaprasta}`,
                    userId: userId || 1,
                    refId: closeTx.id,
                    branchCode: '001'
                });
            }

            // 4. Update Account Status
            await tx.nasabahWanaprasta.update({
                where: { noWanaprasta },
                data: {
                    status: 'T', // Closed
                    saldo: 0
                }
            });

            return { success: true, refund: currentBalance };
        });
    }
}
