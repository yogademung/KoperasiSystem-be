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
};
exports.TabrelaService = TabrelaService;
exports.TabrelaService = TabrelaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], TabrelaService);
//# sourceMappingURL=tabrela.service.js.map