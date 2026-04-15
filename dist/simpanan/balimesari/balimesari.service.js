"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalimesariService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let BalimesariService = class BalimesariService {
    prisma;
    eventEmitter;
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
    }
    async create(createDto) {
        const noBalimesari = `BLM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        return this.prisma.$transaction(async (tx) => {
            const balimesari = await tx.nasabahBalimesari.create({
                data: {
                    noBalimesari,
                    nasabahId: createDto.nasabahId,
                    tglBuka: new Date(),
                    saldo: createDto.setoranAwal || 0,
                    interestRate: 3.0,
                    status: 'A',
                },
            });
            if (createDto.setoranAwal && createDto.setoranAwal > 0) {
                const transaction = await tx.transBalimesari.create({
                    data: {
                        noBalimesari,
                        tipeTrans: 'SETORAN',
                        nominal: createDto.setoranAwal,
                        saldoAkhir: createDto.setoranAwal,
                        keterangan: createDto.keterangan ||
                            'Setoran Awal Pembukaan Rekening Bali Mesari',
                        createdBy: 'SYSTEM',
                    },
                });
                try {
                    this.eventEmitter.emit('transaction.created', {
                        transType: 'BALIMESARI_SETOR',
                        amount: createDto.setoranAwal,
                        description: createDto.keterangan ||
                            'Setoran Awal Pembukaan Rekening Bali Mesari',
                        userId: 1,
                        refId: transaction.id,
                        branchCode: '001',
                    });
                }
                catch (error) {
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
                    select: { nama: true, noKtp: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(noBalimesari) {
        const account = await this.prisma.nasabahBalimesari.findUnique({
            where: { noBalimesari },
            include: {
                nasabah: true,
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                },
            },
        });
        if (!account) {
            throw new common_1.NotFoundException('Rekening Bali Mesari tidak ditemukan');
        }
        return account;
    }
    async setoran(noBalimesari, dto, userId) {
        return this.prisma.$transaction(async (tx) => {
            const account = await tx.nasabahBalimesari.findUnique({
                where: { noBalimesari },
            });
            if (!account) {
                throw new common_1.NotFoundException('Rekening tidak ditemukan');
            }
            if (account.status !== 'A') {
                throw new common_1.BadRequestException('Rekening tidak aktif');
            }
            const newBalance = Number(account.saldo) + dto.nominal;
            const transaction = await tx.transBalimesari.create({
                data: {
                    noBalimesari,
                    tipeTrans: 'SETORAN',
                    nominal: dto.nominal,
                    saldoAkhir: newBalance,
                    keterangan: dto.keterangan || 'Setoran Bali Mesari',
                    createdBy: userId?.toString() || 'SYSTEM',
                },
            });
            await tx.nasabahBalimesari.update({
                where: { noBalimesari },
                data: { saldo: newBalance },
            });
            try {
                this.eventEmitter.emit('transaction.created', {
                    transType: 'BALIMESARI_SETOR',
                    amount: dto.nominal,
                    description: transaction.keterangan,
                    userId: userId || 1,
                    refId: transaction.id,
                    branchCode: '001',
                });
            }
            catch (error) {
                console.error('Failed to emit transaction event:', error);
            }
            return transaction;
        });
    }
    async penarikan(noBalimesari, dto, userId) {
        return this.prisma.$transaction(async (tx) => {
            const account = await tx.nasabahBalimesari.findUnique({
                where: { noBalimesari },
            });
            if (!account) {
                throw new common_1.NotFoundException('Rekening tidak ditemukan');
            }
            if (account.status !== 'A') {
                throw new common_1.BadRequestException('Rekening tidak aktif');
            }
            if (Number(account.saldo) < dto.nominal) {
                throw new common_1.BadRequestException('Saldo tidak mencukupi');
            }
            const newBalance = Number(account.saldo) - dto.nominal;
            const transaction = await tx.transBalimesari.create({
                data: {
                    noBalimesari,
                    tipeTrans: 'PENARIKAN',
                    nominal: dto.nominal,
                    saldoAkhir: newBalance,
                    keterangan: dto.keterangan || 'Penarikan Bali Mesari',
                    createdBy: userId?.toString() || 'SYSTEM',
                },
            });
            await tx.nasabahBalimesari.update({
                where: { noBalimesari },
                data: { saldo: newBalance },
            });
            try {
                this.eventEmitter.emit('transaction.created', {
                    transType: 'BALIMESARI_TARIK',
                    amount: dto.nominal,
                    description: transaction.keterangan,
                    userId: userId || 1,
                    refId: transaction.id,
                    branchCode: '001',
                });
            }
            catch (error) {
                console.error('Failed to emit transaction event:', error);
            }
            return transaction;
        });
    }
    async getTransactions(noBalimesari, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [transactions, total] = await Promise.all([
            this.prisma.transBalimesari.findMany({
                where: { noBalimesari },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.transBalimesari.count({
                where: { noBalimesari },
            }),
        ]);
        return {
            data: transactions,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async voidTransaction(transId, txInput) {
        const executeLogic = async (tx) => {
            const original = await tx.transBalimesari.findUnique({
                where: { id: transId },
            });
            if (!original)
                throw new common_1.NotFoundException(`Transaction ${transId} not found`);
            const account = await tx.nasabahBalimesari.findUnique({
                where: { noBalimesari: original.noBalimesari },
            });
            if (!account)
                throw new common_1.NotFoundException('Account not found');
            let newBalance = Number(account.saldo);
            const nominal = Number(original.nominal);
            let reversalAmount = 0;
            if (original.tipeTrans === 'SETORAN' ||
                original.tipeTrans === 'BALIMESARI_SETOR') {
                newBalance -= nominal;
                reversalAmount = -nominal;
            }
            else if (original.tipeTrans === 'PENARIKAN' ||
                original.tipeTrans === 'BALIMESARI_TARIK') {
                newBalance += nominal;
                reversalAmount = nominal;
            }
            else {
                newBalance -= nominal;
                reversalAmount = -nominal;
            }
            await tx.nasabahBalimesari.update({
                where: { noBalimesari: original.noBalimesari },
                data: { saldo: newBalance },
            });
            return tx.transBalimesari.create({
                data: {
                    noBalimesari: original.noBalimesari,
                    tipeTrans: 'KOREKSI',
                    nominal: reversalAmount,
                    saldoAkhir: newBalance,
                    keterangan: `VOID Trans #${original.id}: ${original.keterangan}`,
                    createdBy: 'SYSTEM',
                },
            });
        };
        if (txInput) {
            return executeLogic(txInput);
        }
        else {
            return this.prisma.$transaction(executeLogic);
        }
    }
    async closeAccount(noBalimesari, dto, userId) {
        const { reason, penalty = 0, adminFee = 0 } = dto;
        return this.prisma.$transaction(async (tx) => {
            const account = await tx.nasabahBalimesari.findUnique({
                where: { noBalimesari },
            });
            if (!account)
                throw new common_1.NotFoundException('Account not found');
            if (account.status !== 'A')
                throw new common_1.BadRequestException('Account is not active');
            let currentBalance = Number(account.saldo);
            if (penalty > 0) {
                currentBalance -= penalty;
                await tx.transBalimesari.create({
                    data: {
                        noBalimesari,
                        tipeTrans: 'DENDA',
                        nominal: -penalty,
                        saldoAkhir: currentBalance,
                        keterangan: `Denda Penutupan: ${reason}`,
                        createdBy: userId?.toString() || 'SYSTEM',
                    },
                });
            }
            if (adminFee > 0) {
                currentBalance -= adminFee;
                await tx.transBalimesari.create({
                    data: {
                        noBalimesari,
                        tipeTrans: 'BIAYA_ADMIN',
                        nominal: -adminFee,
                        saldoAkhir: currentBalance,
                        keterangan: 'Biaya Administrasi Penutupan',
                        createdBy: userId?.toString() || 'SYSTEM',
                    },
                });
            }
            if (currentBalance > 0) {
                const closeTx = await tx.transBalimesari.create({
                    data: {
                        noBalimesari,
                        tipeTrans: 'TUTUP',
                        nominal: -currentBalance,
                        saldoAkhir: 0,
                        keterangan: `Penutupan Rekening: ${reason}`,
                        createdBy: userId?.toString() || 'SYSTEM',
                    },
                });
                this.eventEmitter.emit('transaction.created', {
                    transType: 'BALIMESARI_TUTUP',
                    amount: currentBalance,
                    description: `Penutupan Rekening ${noBalimesari}`,
                    userId: userId || 1,
                    refId: closeTx.id,
                    branchCode: '001',
                });
            }
            await tx.nasabahBalimesari.update({
                where: { noBalimesari },
                data: {
                    status: 'T',
                    saldo: 0,
                },
            });
            return { success: true, refund: currentBalance };
        });
    }
};
exports.BalimesariService = BalimesariService;
exports.BalimesariService = BalimesariService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], BalimesariService);
//# sourceMappingURL=balimesari.service.js.map