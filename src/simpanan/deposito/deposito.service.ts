import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateDepositoDto } from './dto/create-deposito.dto';

@Injectable()
export class DepositoService {
    constructor(private prisma: PrismaService) { }

    async create(createDto: CreateDepositoDto, userId: number) {
        const { nasabahId, nominal, jangkaWaktuBulan, bunga, keterangan } = createDto;

        // Validate Nasabah
        const nasabah = await this.prisma.nasabah.findUnique({
            where: { id: nasabahId },
        });
        if (!nasabah) throw new NotFoundException('Nasabah not found');

        // Generate No Jangka (Simple logic: J-YYYYMM-RANDOM)
        const date = new Date();
        const yearMonth = date.toISOString().slice(0, 7).replace('-', ''); // YYYYMM
        const random = Math.floor(1000 + Math.random() * 9000); // 4 digit random
        const noJangka = `J-${yearMonth}-${random}`;

        // Calculate Maturity Date
        const tglBuka = new Date();
        const tglJatuhTempo = new Date(tglBuka);
        tglJatuhTempo.setMonth(tglJatuhTempo.getMonth() + jangkaWaktuBulan);

        // Create Deposito Entity
        // Using prisma.$transaction to ensure atomicity if we were adding initial transaction, 
        // but here we just create the Master Record. 
        // Usually opening a deposit involves "Setor Tunai" or "Transfer". 
        // For simplicity, we create the account with the nominal as the initial balance?
        // Wait, m_nasabah_jangka stores 'nominal' (Principal). 
        // Unlike Anggota/Tabrela which have balance/saldo, Deposito is usually fixed principal.

        return this.prisma.$transaction(async (tx) => {
            // 1. Create Master Record
            const deposito = await tx.nasabahJangka.create({
                data: {
                    noJangka,
                    nasabahId,
                    tglBuka,
                    tglJatuhTempo,
                    nominal,
                    bunga,
                    payoutMode: createDto.payoutMode || 'MATURITY',
                    targetAccountId: createDto.targetAccountId,
                    status: 'A', // Active
                    createdBy: userId.toString(),
                },
            });

            // 2. Create Initial Transaction (Setoran Awal)
            await tx.transJangka.create({
                data: {
                    noJangka,
                    tipeTrans: 'SETORAN',
                    nominal: nominal,
                    keterangan: 'Setoran Awal Deposito',
                    createdBy: userId.toString(),
                },
            });

            return deposito;
        });
    }

    async findAll() {
        return this.prisma.nasabahJangka.findMany({
            include: {
                nasabah: {
                    select: { nama: true, noKtp: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(noJangka: string) {
        const deposito = await this.prisma.nasabahJangka.findUnique({
            where: { noJangka },
            include: {
                nasabah: true,
                transactions: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!deposito) throw new NotFoundException('Deposito not found');

        // Calculate Accumulated Interest (Credit Sum)
        const accumulatedInterest = deposito.transactions
            .filter(t => t.tipeTrans === 'BUNGA')
            .reduce((sum, t) => sum + Number(t.nominal), 0);

        return {
            ...deposito,
            accumulatedInterest
        };
    }

    // Cairkan / Withdraw
    async withdraw(noJangka: string, userId: number) {
        const deposito = await this.prisma.nasabahJangka.findUnique({
            where: { noJangka },
        });
        if (!deposito) throw new NotFoundException('Deposito not found');
        if (deposito.status !== 'A') throw new BadRequestException('Deposito is not active');

        // In a real system, we'd calculate penalty if before maturity.
        // Here we just mark as Closed ('C')? Or 'L' (Liquidated)?
        // And verify nominal.

        return this.prisma.$transaction(async (tx) => {
            // Create Transaction Record (Payout)
            await tx.transJangka.create({
                data: {
                    noJangka,
                    tipeTrans: 'CAIR',
                    nominal: deposito.nominal.negated(), // Outflow
                    keterangan: 'Pencairan Deposito',
                    createdBy: userId.toString(),
                },
            });

            // Update Status
            return tx.nasabahJangka.update({
                where: { noJangka },
                data: {
                    status: 'C', // Closed
                    updatedBy: userId.toString(),
                },
            });
        });
    }
}
