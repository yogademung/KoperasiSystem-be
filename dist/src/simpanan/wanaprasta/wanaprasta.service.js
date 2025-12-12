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
exports.WanaprastaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let WanaprastaService = class WanaprastaService {
    prisma;
    eventEmitter;
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
    }
    async create(createDto) {
        const noWanaprasta = `WNP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        return this.prisma.$transaction(async (tx) => {
            const wanaprasta = await tx.nasabahWanaprasta.create({
                data: {
                    noWanaprasta,
                    nasabahId: createDto.nasabahId,
                    tglBuka: new Date(),
                    saldo: createDto.setoranAwal || 0,
                    interestRate: 4.0,
                    status: 'A',
                }
            });
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
                try {
                    this.eventEmitter.emit('transaction.created', {
                        transType: 'WANAPRASTA_SETOR',
                        amount: createDto.setoranAwal,
                        description: createDto.keterangan || 'Setoran Awal Pembukaan Rekening Wanaprasta',
                        userId: 1,
                        refId: transaction.id,
                        branchCode: '001'
                    });
                }
                catch (error) {
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
    async findOne(noWanaprasta) {
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
            throw new common_1.NotFoundException('Rekening Wanaprasta tidak ditemukan');
        }
        return account;
    }
    async setoran(noWanaprasta, dto) {
        return this.prisma.$transaction(async (tx) => {
            const account = await tx.nasabahWanaprasta.findUnique({
                where: { noWanaprasta }
            });
            if (!account) {
                throw new common_1.NotFoundException('Rekening tidak ditemukan');
            }
            if (account.status !== 'A') {
                throw new common_1.BadRequestException('Rekening tidak aktif');
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
            try {
                this.eventEmitter.emit('transaction.created', {
                    transType: 'WANAPRASTA_SETOR',
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
    async penarikan(noWanaprasta, dto) {
        return this.prisma.$transaction(async (tx) => {
            const account = await tx.nasabahWanaprasta.findUnique({
                where: { noWanaprasta }
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
            try {
                this.eventEmitter.emit('transaction.created', {
                    transType: 'WANAPRASTA_TARIK',
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
    async getTransactions(noWanaprasta, page = 1, limit = 10) {
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
    async voidTransaction(transId) {
        return this.prisma.$transaction(async (tx) => {
            const original = await tx.transWanaprasta.findUnique({ where: { id: transId } });
            if (!original)
                throw new common_1.NotFoundException(`Transaction ${transId} not found`);
            const account = await tx.nasabahWanaprasta.findUnique({ where: { noWanaprasta: original.noWanaprasta } });
            if (!account)
                throw new common_1.NotFoundException('Account not found');
            let newBalance = Number(account.saldo);
            const nominal = Number(original.nominal);
            if (original.tipeTrans === 'SETORAN') {
                newBalance -= nominal;
            }
            else if (original.tipeTrans === 'PENARIKAN') {
                newBalance += nominal;
            }
            await tx.nasabahWanaprasta.update({
                where: { noWanaprasta: original.noWanaprasta },
                data: { saldo: newBalance }
            });
            return tx.transWanaprasta.create({
                data: {
                    noWanaprasta: original.noWanaprasta,
                    tipeTrans: 'KOREKSI',
                    nominal: nominal,
                    saldoAkhir: newBalance,
                    keterangan: `VOID Trans #${original.id}: ${original.keterangan}`,
                    createdBy: 'SYSTEM'
                }
            });
        });
    }
};
exports.WanaprastaService = WanaprastaService;
exports.WanaprastaService = WanaprastaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], WanaprastaService);
//# sourceMappingURL=wanaprasta.service.js.map