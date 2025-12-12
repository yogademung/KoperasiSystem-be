import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateDepositoDto } from './dto/create-deposito.dto';

@Injectable()
export class DepositoService {
    constructor(
        private prisma: PrismaService,
        private eventEmitter: EventEmitter2
    ) { }

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
            const transaction = await tx.transJangka.create({
                data: {
                    noJangka,
                    tipeTrans: 'SETORAN',
                    nominal: nominal,
                    keterangan: 'Setoran Awal Deposito',
                    createdBy: userId.toString(),
                },
            });

            // EMIT EVENT
            this.eventEmitter.emit('transaction.created', {
                transType: 'DEPOSITO_SETOR',
                amount: nominal,
                description: 'Setoran Awal Deposito',
                userId: userId,
                refId: transaction.id,
                branchCode: '001'
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

        return this.prisma.$transaction(async (tx) => {
            // Create Transaction Record (Payout)
            const transaction = await tx.transJangka.create({
                data: {
                    noJangka,
                    tipeTrans: 'CAIR',
                    nominal: deposito.nominal.negated(), // Outflow
                    keterangan: 'Pencairan Deposito',
                    createdBy: userId.toString(),
                },
            });

            // Update Status
            const result = await tx.nasabahJangka.update({
                where: { noJangka },
                data: {
                    status: 'C', // Closed
                    updatedBy: userId.toString(),
                },
            });

            // EMIT EVENT
            this.eventEmitter.emit('transaction.created', {
                transType: 'DEPOSITO_CAIR',
                amount: Number(deposito.nominal),
                description: 'Pencairan Deposito',
                userId: userId,
                refId: transaction.id,
                branchCode: '001'
            });

            return result;
        });
    }
}
