import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateBalimesariDto } from './dto/create-balimesari.dto';
import { BalimesariTransactionDto } from './dto/transaction.dto';

@Injectable()
export class BalimesariService {
    constructor(
        private prisma: PrismaService,
        private eventEmitter: EventEmitter2
    ) { }

    /**
     * Create new Bali Mesari account
     * Bali Mesari is a competitive savings account with flexible terms
     */
    async create(createDto: CreateBalimesariDto) {
        // Generate account number: BLM-{timestamp}-{random}
        const noBalimesari = `BLM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        return this.prisma.$transaction(async (tx) => {
            // 1. Create Account
            const balimesari = await tx.nasabahBalimesari.create({
                data: {
                    noBalimesari,
                    nasabahId: createDto.nasabahId,
                    tglBuka: new Date(),
                    saldo: createDto.setoranAwal || 0,
                    interestRate: 3.0, // Competitive interest rate (3.0%)
                    status: 'A', // Active
                }
            });

            // 2. Create Initial Transaction if setoranAwal > 0
            if (createDto.setoranAwal && createDto.setoranAwal > 0) {
                const transaction = await tx.transBalimesari.create({
                    data: {
                        noBalimesari,
                        tipeTrans: 'SETORAN',
                        nominal: createDto.setoranAwal,
                        saldoAkhir: createDto.setoranAwal,
                        keterangan: createDto.keterangan || 'Setoran Awal Pembukaan Rekening Bali Mesari',
                        createdBy: 'SYSTEM'
                    }
                });

                // EMIT EVENT
                try {
                    this.eventEmitter.emit('transaction.created', {
                        transType: 'BALIMESARI_SETOR',
                        amount: createDto.setoranAwal,
                        description: createDto.keterangan || 'Setoran Awal Pembukaan Rekening Bali Mesari',
                        userId: 1,
                        refId: transaction.id,
                        branchCode: '001'
                    });
                } catch (error) {
                    console.error('Failed to emit transaction event:', error);
                }
            }

            return balimesari;
        });
    }

    async findAll() {
        return this.prisma.nasabahBalimesari.findMany({
            include: {
                nasabah: {
                    select: { nama: true, noKtp: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOne(noBalimesari: string) {
        const account = await this.prisma.nasabahBalimesari.findUnique({
            where: { noBalimesari },
            include: {
                nasabah: true,
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 20
                }
            }
        });

        if (!account) {
            throw new NotFoundException('Rekening Bali Mesari tidak ditemukan');
        }

        return account;
    }

    async setoran(noBalimesari: string, dto: BalimesariTransactionDto) {
        return this.prisma.$transaction(async (tx) => {
            const account = await tx.nasabahBalimesari.findUnique({
                where: { noBalimesari }
            });

            if (!account) {
                throw new NotFoundException('Rekening tidak ditemukan');
            }

            if (account.status !== 'A') {
                throw new BadRequestException('Rekening tidak aktif');
            }

            const newBalance = Number(account.saldo) + dto.nominal;

            const transaction = await tx.transBalimesari.create({
                data: {
                    noBalimesari,
                    tipeTrans: 'SETORAN',
                    nominal: dto.nominal,
                    saldoAkhir: newBalance,
                    keterangan: dto.keterangan || 'Setoran Bali Mesari',
                    createdBy: 'SYSTEM'
                }
            });

            await tx.nasabahBalimesari.update({
                where: { noBalimesari },
                data: { saldo: newBalance }
            });

            // EMIT EVENT
            try {
                this.eventEmitter.emit('transaction.created', {
                    transType: 'BALIMESARI_SETOR',
                    amount: dto.nominal,
                    description: transaction.keterangan,
                    userId: 1,
                    refId: transaction.id,
                    branchCode: '001'
                });
            } catch (error) {
                console.error('Failed to emit transaction event:', error);
            }

            return transaction;
        });
    }

    async penarikan(noBalimesari: string, dto: BalimesariTransactionDto) {
        return this.prisma.$transaction(async (tx) => {
            const account = await tx.nasabahBalimesari.findUnique({
                where: { noBalimesari }
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

            const transaction = await tx.transBalimesari.create({
                data: {
                    noBalimesari,
                    tipeTrans: 'PENARIKAN',
                    nominal: dto.nominal,
                    saldoAkhir: newBalance,
                    keterangan: dto.keterangan || 'Penarikan Bali Mesari',
                    createdBy: 'SYSTEM'
                }
            });

            await tx.nasabahBalimesari.update({
                where: { noBalimesari },
                data: { saldo: newBalance }
            });

            // EMIT EVENT
            try {
                this.eventEmitter.emit('transaction.created', {
                    transType: 'BALIMESARI_TARIK',
                    amount: dto.nominal,
                    description: transaction.keterangan,
                    userId: 1,
                    refId: transaction.id,
                    branchCode: '001'
                });
            } catch (error) {
                console.error('Failed to emit transaction event:', error);
            }

            return transaction;
        });
    }

    async getTransactions(noBalimesari: string, page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const [transactions, total] = await Promise.all([
            this.prisma.transBalimesari.findMany({
                where: { noBalimesari },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            this.prisma.transBalimesari.count({
                where: { noBalimesari }
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
}
