import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateWanaprastaDto } from './dto/create-wanaprasta.dto';
import { WanaprastaTransactionDto } from './dto/transaction.dto';

@Injectable()
export class WanaprastaService {
    constructor(private prisma: PrismaService) { }

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
                await tx.transWanaprasta.create({
                    data: {
                        noWanaprasta,
                        tipeTrans: 'SETORAN',
                        nominal: createDto.setoranAwal,
                        saldoAkhir: createDto.setoranAwal,
                        keterangan: createDto.keterangan || 'Setoran Awal Pembukaan Rekening Wanaprasta',
                        createdBy: 'SYSTEM'
                    }
                });
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

    async setoran(noWanaprasta: string, dto: WanaprastaTransactionDto) {
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
                    createdBy: 'SYSTEM'
                }
            });

            await tx.nasabahWanaprasta.update({
                where: { noWanaprasta },
                data: { saldo: newBalance }
            });

            return transaction;
        });
    }

    async penarikan(noWanaprasta: string, dto: WanaprastaTransactionDto) {
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
                    createdBy: 'SYSTEM'
                }
            });

            await tx.nasabahWanaprasta.update({
                where: { noWanaprasta },
                data: { saldo: newBalance }
            });

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
}
