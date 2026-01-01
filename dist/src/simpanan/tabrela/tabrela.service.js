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
exports.TabrelaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let TabrelaService = class TabrelaService {
    prisma;
    eventEmitter;
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
    }
    async create(createDto) {
        const noTab = `TAB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        return this.prisma.$transaction(async (tx) => {
            const tabrela = await tx.nasabahTab.create({
                data: {
                    noTab,
                    nasabahId: createDto.nasabahId,
                    tglBuka: new Date(),
                    saldo: createDto.setoranAwal || 0,
                    interestRate: 0,
                    status: 'A',
                }
            });
            if (createDto.setoranAwal && createDto.setoranAwal > 0) {
                const transaction = await tx.transTab.create({
                    data: {
                        noTab,
                        tipeTrans: 'SETORAN',
                        nominal: createDto.setoranAwal,
                        saldoAkhir: createDto.setoranAwal,
                        keterangan: createDto.keterangan || 'Setoran Awal Pembukaan Rekening',
                        latitude: createDto.latitude,
                        longitude: createDto.longitude,
                        createdBy: 'SYSTEM'
                    }
                });
                this.eventEmitter.emit('transaction.created', {
                    transType: 'TABRELA_SETOR',
                    amount: createDto.setoranAwal,
                    description: createDto.keterangan || 'Setoran Awal Pembukaan Rekening',
                    userId: 1,
                    refId: transaction.id,
                    branchCode: '001'
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
    async findOne(noTab) {
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
            throw new common_1.NotFoundException(`Tabungan ${noTab} not found`);
        }
        return account;
    }
    async setoran(noTab, dto, userId) {
        return this.prisma.$transaction(async (tx) => {
            const account = await tx.nasabahTab.findUnique({ where: { noTab } });
            if (!account)
                throw new common_1.NotFoundException('Tabungan not found');
            if (account.status !== 'A')
                throw new common_1.BadRequestException('Account not active');
            const newBalance = Number(account.saldo) + dto.amount;
            const transaction = await tx.transTab.create({
                data: {
                    noTab,
                    tipeTrans: dto.transType || 'SETORAN',
                    nominal: dto.amount,
                    saldoAkhir: newBalance,
                    keterangan: dto.description,
                    latitude: dto.latitude,
                    longitude: dto.longitude,
                    createdBy: userId?.toString() || 'SYSTEM'
                }
            });
            await tx.nasabahTab.update({
                where: { noTab },
                data: { saldo: newBalance }
            });
            this.eventEmitter.emit('transaction.created', {
                transType: 'TABRELA_SETOR',
                amount: dto.amount,
                description: transaction.keterangan,
                userId: userId || 1,
                refId: transaction.id,
                branchCode: '001'
            });
            return { success: true };
        });
    }
    async penarikan(noTab, dto, userId) {
        return this.prisma.$transaction(async (tx) => {
            const account = await tx.nasabahTab.findUnique({ where: { noTab } });
            if (!account)
                throw new common_1.NotFoundException('Tabungan not found');
            if (account.status !== 'A')
                throw new common_1.BadRequestException('Account not active');
            if (Number(account.saldo) < dto.amount) {
                throw new common_1.BadRequestException('Insufficient balance');
            }
            const newBalance = Number(account.saldo) - dto.amount;
            const transaction = await tx.transTab.create({
                data: {
                    noTab,
                    tipeTrans: 'PENARIKAN',
                    nominal: -Math.abs(dto.amount),
                    saldoAkhir: newBalance,
                    keterangan: dto.description,
                    latitude: dto.latitude,
                    longitude: dto.longitude,
                    createdBy: userId?.toString() || 'SYSTEM'
                }
            });
            await tx.nasabahTab.update({
                where: { noTab },
                data: { saldo: newBalance }
            });
            this.eventEmitter.emit('transaction.created', {
                transType: 'TABRELA_TARIK',
                amount: dto.amount,
                description: transaction.keterangan,
                userId: userId || 1,
                refId: transaction.id,
                branchCode: '001'
            });
            return { success: true };
        });
    }
    async voidTransaction(transId, txInput) {
        const executeLogic = async (tx) => {
            const original = await tx.transTab.findUnique({
                where: { id: transId }
            });
            if (!original)
                throw new common_1.BadRequestException(`Transaction with ID ${transId} not found`);
            const account = await tx.nasabahTab.findUnique({
                where: { noTab: original.noTab }
            });
            if (!account)
                throw new common_1.BadRequestException('Account not found');
            const reversalAmount = Number(original.nominal);
            const newBalance = Number(account.saldo) - reversalAmount;
            await tx.nasabahTab.update({
                where: { noTab: original.noTab },
                data: { saldo: newBalance }
            });
            return tx.transTab.create({
                data: {
                    noTab: original.noTab,
                    tipeTrans: 'KOREKSI',
                    nominal: -reversalAmount,
                    saldoAkhir: newBalance,
                    keterangan: `VOID/REVERSAL of Trans #${original.id}: ${original.keterangan || ''}`,
                    createdBy: original.createdBy || 'SYSTEM'
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
    async closeAccount(noTab, dto, userId) {
        return this.prisma.$transaction(async (tx) => {
            const account = await tx.nasabahTab.findUnique({ where: { noTab } });
            if (!account)
                throw new common_1.NotFoundException('Account not found');
            if (account.status !== 'A')
                throw new common_1.BadRequestException('Account is not active');
            let currentBalance = Number(account.saldo);
            const penalty = dto.penalty || 0;
            const adminFee = dto.adminFee || 0;
            if (penalty > 0) {
                currentBalance -= penalty;
                const penaltyTx = await tx.transTab.create({
                    data: {
                        noTab,
                        tipeTrans: 'DENDA',
                        nominal: -penalty,
                        saldoAkhir: currentBalance,
                        keterangan: `Denda Penutupan: ${dto.reason}`,
                        createdBy: userId?.toString() || 'SYSTEM'
                    }
                });
                this.eventEmitter.emit('transaction.created', {
                    transType: 'TABRELA_DENDA',
                    amount: penalty,
                    description: `Denda Penutupan ${noTab}`,
                    userId: userId || 1,
                    refId: penaltyTx.id,
                    branchCode: '001'
                });
            }
            if (adminFee > 0) {
                currentBalance -= adminFee;
                const adminTx = await tx.transTab.create({
                    data: {
                        noTab,
                        tipeTrans: 'BIAYA_ADMIN',
                        nominal: -adminFee,
                        saldoAkhir: currentBalance,
                        keterangan: 'Biaya Administrasi Penutupan',
                        createdBy: userId?.toString() || 'SYSTEM'
                    }
                });
                this.eventEmitter.emit('transaction.created', {
                    transType: 'TABRELA_ADMIN',
                    amount: adminFee,
                    description: `Biaya Admin Penutupan ${noTab}`,
                    userId: userId || 1,
                    refId: adminTx.id,
                    branchCode: '001'
                });
            }
            if (currentBalance > 0) {
                const closeTx = await tx.transTab.create({
                    data: {
                        noTab,
                        tipeTrans: 'TUTUP',
                        nominal: -currentBalance,
                        saldoAkhir: 0,
                        keterangan: `Penutupan Rekening: ${dto.reason}`,
                        createdBy: userId?.toString() || 'SYSTEM'
                    }
                });
                this.eventEmitter.emit('transaction.created', {
                    transType: 'TABRELA_TUTUP',
                    amount: currentBalance,
                    description: `Penutupan Rekening ${noTab}`,
                    userId: userId || 1,
                    refId: closeTx.id,
                    branchCode: '001'
                });
            }
            await tx.nasabahTab.update({
                where: { noTab },
                data: {
                    status: 'T',
                    saldo: 0
                }
            });
            return { success: true, refund: currentBalance };
        });
    }
};
exports.TabrelaService = TabrelaService;
exports.TabrelaService = TabrelaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], TabrelaService);
//# sourceMappingURL=tabrela.service.js.map