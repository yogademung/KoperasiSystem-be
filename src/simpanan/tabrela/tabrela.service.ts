import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTabrelaDto } from './dto/create-tabrela.dto';

@Injectable()
export class TabrelaService {
    constructor(private prisma: PrismaService) { }

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
                }
            });

            // 2. Create Initial Transaction if setoranAwal > 0
            if (createDto.setoranAwal && createDto.setoranAwal > 0) {
                await tx.transTab.create({
                    data: {
                        noTab,
                        tipeTrans: 'SETORAN',
                        nominal: createDto.setoranAwal,
                        saldoAkhir: createDto.setoranAwal,
                        keterangan: createDto.keterangan || 'Setoran Awal Pembukaan Rekening',
                        createdBy: 'SYSTEM' // Should be user ID from auth context
                    }
                });
            }

            return tabrela;
        });
    }

    async findAll() {
        return this.prisma.nasabahTab.findMany({
            include: {
                nasabah: {
                    select: { nama: true, noKtp: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            where: { status: 'A' }
        });
    }

    async findOne(noTab: string) {
        const account = await this.prisma.nasabahTab.findUnique({
            where: { noTab },
            include: {
                nasabah: true,
                transactions: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!account) {
            throw new NotFoundException(`Tabungan ${noTab} not found`);
        }

        return account;
    }
    async setoran(
        noTab: string,
        dto: { amount: number; description?: string; transType?: string },
        userId?: any
    ) {
        return this.prisma.$transaction(async (tx) => {
            const account = await tx.nasabahTab.findUnique({ where: { noTab } });
            if (!account) throw new NotFoundException('Tabungan not found');
            if (account.status !== 'A') throw new BadRequestException('Account not active');

            const newBalance = Number(account.saldo) + dto.amount;

            // Create Transaction
            await tx.transTab.create({
                data: {
                    noTab,
                    tipeTrans: dto.transType || 'SETORAN',
                    nominal: dto.amount,
                    saldoAkhir: newBalance,
                    keterangan: dto.description,
                    createdBy: userId?.toString() || 'SYSTEM'
                }
            });

            // Update Balance
            await tx.nasabahTab.update({
                where: { noTab },
                data: { saldo: newBalance }
            });

            return { success: true };
        });
    }

    async penarikan(
        noTab: string,
        dto: { amount: number; description?: string },
        userId?: any
    ) {
        return this.prisma.$transaction(async (tx) => {
            const account = await tx.nasabahTab.findUnique({ where: { noTab } });
            if (!account) throw new NotFoundException('Tabungan not found');
            if (account.status !== 'A') throw new BadRequestException('Account not active');

            if (Number(account.saldo) < dto.amount) {
                throw new BadRequestException('Insufficient balance');
            }

            const newBalance = Number(account.saldo) - dto.amount;

            // Create Transaction (Debit)
            await tx.transTab.create({
                data: {
                    noTab,
                    tipeTrans: 'PENARIKAN',
                    nominal: -Math.abs(dto.amount), // Negative for withdrawal
                    saldoAkhir: newBalance,
                    keterangan: dto.description,
                    createdBy: userId?.toString() || 'SYSTEM'
                }
            });

            // Update Balance
            await tx.nasabahTab.update({
                where: { noTab },
                data: { saldo: newBalance }
            });

            return { success: true };
        });
    }
}
