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
exports.BrahmacariService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let BrahmacariService = class BrahmacariService {
    prisma;
    eventEmitter;
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
    }
    async create(createDto) {
        const noBrahmacari = `BRA-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        return this.prisma.$transaction(async (tx) => {
            const brahmacari = await tx.nasabahBrahmacari.create({
                data: {
                    noBrahmacari,
                    nasabahId: createDto.nasabahId,
                    tglBuka: new Date(),
                    saldo: createDto.setoranAwal || 0,
                    interestRate: 3.5,
                    status: 'A',
                }
            });
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
                try {
                    this.eventEmitter.emit('transaction.created', {
                        transType: 'BRAHMACARI_SETOR',
                        amount: createDto.setoranAwal,
                        description: createDto.keterangan || 'Setoran Awal Pembukaan Rekening Brahmacari',
                        userId: 1,
                        refId: transaction.id,
                        branchCode: '001'
                    });
                }
                catch (error) {
                    console.error('Failed to emit transaction event:', error);
                }
            }
            return brahmacari;
        });
    }
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
    async findOne(noBrahmacari) {
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
            throw new common_1.NotFoundException('Rekening Brahmacari tidak ditemukan');
        }
        return account;
    }
    async setoran(noBrahmacari, dto) {
        return this.prisma.$transaction(async (tx) => {
            const account = await tx.nasabahBrahmacari.findUnique({
                where: { noBrahmacari }
            });
            if (!account) {
                throw new common_1.NotFoundException('Rekening tidak ditemukan');
            }
            if (account.status !== 'A') {
                throw new common_1.BadRequestException('Rekening tidak aktif');
            }
            const newBalance = Number(account.saldo) + dto.nominal;
            const transaction = await tx.transBrahmacari.create({
                data: {
                    noBrahmacari,
                    tipeTrans: 'SETORAN',
                    nominal: dto.nominal,
                    saldoAkhir: newBalance,
                    keterangan: dto.keterangan || 'Setoran Brahmacari',
                    createdBy: 'SYSTEM'
                }
            });
            await tx.nasabahBrahmacari.update({
                where: { noBrahmacari },
                data: { saldo: newBalance }
            });
            try {
                this.eventEmitter.emit('transaction.created', {
                    transType: 'BRAHMACARI_SETOR',
                    amount: dto.nominal,
                    description: transaction.keterangan,
                    userId: 1,
                    refId: transaction.id,
                    branchCode: '001'
                });
            }
            catch (error) {
                console.error('Failed to emit transaction event:', error);
            }
            return transaction;
        });
    }
    async penarikan(noBrahmacari, dto) {
        return this.prisma.$transaction(async (tx) => {
            const account = await tx.nasabahBrahmacari.findUnique({
                where: { noBrahmacari }
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
            const transaction = await tx.transBrahmacari.create({
                data: {
                    noBrahmacari,
                    tipeTrans: 'PENARIKAN',
                    nominal: dto.nominal,
                    saldoAkhir: newBalance,
                    keterangan: dto.keterangan || 'Penarikan Brahmacari',
                    createdBy: 'SYSTEM'
                }
            });
            await tx.nasabahBrahmacari.update({
                where: { noBrahmacari },
                data: { saldo: newBalance }
            });
            try {
                this.eventEmitter.emit('transaction.created', {
                    transType: 'BRAHMACARI_TARIK',
                    amount: dto.nominal,
                    description: transaction.keterangan,
                    userId: 1,
                    refId: transaction.id,
                    branchCode: '001'
                });
            }
            catch (error) {
                console.error('Failed to emit transaction event:', error);
            }
            return transaction;
        });
    }
    async getTransactions(noBrahmacari, page = 1, limit = 10) {
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
    async voidTransaction(transId, txInput) {
        const executeLogic = async (tx) => {
            const original = await tx.transBrahmacari.findUnique({
                where: { id: transId }
            });
            if (!original)
                throw new common_1.NotFoundException(`Transaction with ID ${transId} not found`);
            const account = await tx.nasabahBrahmacari.findUnique({
                where: { noBrahmacari: original.noBrahmacari }
            });
            if (!account)
                throw new common_1.NotFoundException('Account not found');
            let newBalance = Number(account.saldo);
            const nominal = Number(original.nominal);
            let reversalAmount = 0;
            if (['SETORAN', 'BRAHMACARI_SETOR', 'BUNGA'].includes(original.tipeTrans)) {
                newBalance -= nominal;
                reversalAmount = -nominal;
            }
            else if (['PENARIKAN', 'BRAHMACARI_TARIK', 'ADMIN_FEE', 'PAJAK'].includes(original.tipeTrans)) {
                newBalance += nominal;
                reversalAmount = nominal;
            }
            else {
                newBalance -= nominal;
                reversalAmount = -nominal;
            }
            await tx.nasabahBrahmacari.update({
                where: { noBrahmacari: original.noBrahmacari },
                data: { saldo: newBalance }
            });
            return tx.transBrahmacari.create({
                data: {
                    noBrahmacari: original.noBrahmacari,
                    tipeTrans: 'KOREKSI',
                    nominal: reversalAmount,
                    saldoAkhir: newBalance,
                    keterangan: `VOID/REVERSAL of Trans #${original.id}: ${original.keterangan}`,
                    createdBy: 'SYSTEM'
                }
            });
        };
        if (txInput) {
            return executeLogic(txInput);
        }
        else {
            return this.prisma.$transaction(executeLogic);
        }
    }
    async closeAccount(noBrahmacari, dto) {
        const { reason, penalty = 0, adminFee = 0 } = dto;
        const userId = 1;
        return this.prisma.$transaction(async (tx) => {
            const account = await tx.nasabahBrahmacari.findUnique({ where: { noBrahmacari } });
            if (!account)
                throw new common_1.NotFoundException('Account not found');
            if (account.status !== 'A')
                throw new common_1.BadRequestException('Account is not active');
            let currentBalance = Number(account.saldo);
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
            if (currentBalance > 0) {
                await tx.transBrahmacari.create({
                    data: {
                        noBrahmacari,
                        tipeTrans: 'TUTUP',
                        nominal: -currentBalance,
                        saldoAkhir: 0,
                        keterangan: `Penutupan Rekening: ${reason}`,
                        createdBy: userId?.toString() || 'SYSTEM'
                    }
                });
            }
            await tx.nasabahBrahmacari.update({
                where: { noBrahmacari },
                data: {
                    status: 'T',
                    saldo: 0
                }
            });
            return { success: true, refund: currentBalance };
        });
    }
};
exports.BrahmacariService = BrahmacariService;
exports.BrahmacariService = BrahmacariService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], BrahmacariService);
//# sourceMappingURL=brahmacari.service.js.map