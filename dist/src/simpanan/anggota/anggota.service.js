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
exports.AnggotaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let AnggotaService = class AnggotaService {
    prisma;
    eventEmitter;
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
    }
    async create(dto, userId) {
        const accountNumber = await this.generateAccountNumber(dto.regionCode);
        const existing = await this.prisma.anggotaAccount.findUnique({
            where: { accountNumber }
        });
        if (existing) {
            throw new common_1.BadRequestException('Account number already exists');
        }
        return this.prisma.$transaction(async (tx) => {
            const account = await tx.anggotaAccount.create({
                data: {
                    accountNumber,
                    customerId: dto.customerId,
                    principal: dto.principal,
                    mandatoryInit: dto.mandatoryInit,
                    openDate: new Date(),
                    balance: 0,
                    status: 'D',
                    regionCode: dto.regionCode,
                    groupCode: dto.groupCode,
                    remark: dto.remark,
                    createdBy: userId.toString(),
                    isActive: true
                },
                include: {
                    customer: true
                }
            });
            if (dto.principal > 0) {
                await this.createTransaction(tx, accountNumber, {
                    transType: 'SETORAN_POKOK',
                    amount: dto.principal,
                }, userId);
            }
            if (dto.mandatoryInit > 0) {
                await this.createTransaction(tx, accountNumber, {
                    transType: 'SETORAN_WAJIB',
                    amount: dto.mandatoryInit,
                }, userId);
            }
            return account;
        });
    }
    async findAll() {
        return this.prisma.anggotaAccount.findMany({
            include: { customer: true }
        });
    }
    async findOne(accountNumber) {
        const account = await this.prisma.anggotaAccount.findUnique({
            where: { accountNumber },
            include: {
                customer: true,
                transactions: {
                    orderBy: { transDate: 'desc' },
                    take: 10
                }
            }
        });
        if (!account) {
            throw new common_1.BadRequestException('Account not found');
        }
        return account;
    }
    async setoran(accountNumber, dto, userId) {
        return this.prisma.$transaction(async (tx) => {
            const account = await tx.anggotaAccount.findUnique({
                where: { accountNumber }
            });
            if (!account) {
                throw new common_1.BadRequestException('Account not found');
            }
            if (account.status !== 'A' && account.status !== 'D') {
                throw new common_1.BadRequestException('Account is not active');
            }
            await this.createTransaction(tx, accountNumber, dto, userId);
            if (account.status === 'D') {
                await tx.anggotaAccount.update({
                    where: { accountNumber },
                    data: { status: 'A' }
                });
            }
            return { success: true };
        });
    }
    async penarikan(accountNumber, dto, userId) {
        return this.prisma.$transaction(async (tx) => {
            const account = await tx.anggotaAccount.findUnique({
                where: { accountNumber }
            });
            if (!account) {
                throw new common_1.BadRequestException('Account not found');
            }
            if (account.status !== 'A') {
                throw new common_1.BadRequestException('Account is not active');
            }
            const currentBalance = Number(account.balance);
            if (currentBalance < dto.amount) {
                throw new common_1.BadRequestException('Insufficient balance');
            }
            await this.createTransaction(tx, accountNumber, {
                transType: 'PENARIKAN',
                amount: -Math.abs(dto.amount),
                description: dto.description
            }, userId);
            return { success: true };
        });
    }
    async getTransactions(accountNumber, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [transactions, total] = await Promise.all([
            this.prisma.anggotaTransaction.findMany({
                where: { accountNumber },
                orderBy: { transDate: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.anggotaTransaction.count({
                where: { accountNumber }
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
    async createTransaction(tx, accountNumber, dto, userId) {
        const account = await tx.anggotaAccount.findUnique({ where: { accountNumber } });
        const newBalance = Number(account.balance) + dto.amount;
        const transaction = await tx.anggotaTransaction.create({
            data: {
                accountNumber,
                transDate: new Date(),
                transType: dto.transType,
                amount: dto.amount,
                balanceAfter: newBalance,
                description: dto.description || '',
                userId,
            }
        });
        const updateData = {
            balance: newBalance
        };
        if (dto.transType === 'SETORAN_POKOK') {
            updateData.principal = Number(account.principal) + dto.amount;
        }
        await tx.anggotaAccount.update({
            where: { accountNumber },
            data: updateData
        });
        let eventTransType = '';
        if (dto.transType === 'SETORAN_POKOK')
            eventTransType = 'ANGGOTA_SETOR_POKOK';
        else if (dto.transType === 'SETORAN_WAJIB')
            eventTransType = 'ANGGOTA_SETOR_WAJIB';
        else if (dto.transType === 'SETORAN')
            eventTransType = 'ANGGOTA_SETOR_SUKARELA';
        else if (dto.transType === 'PENARIKAN')
            eventTransType = 'ANGGOTA_TARIK';
        if (eventTransType) {
            try {
                this.eventEmitter.emit('transaction.created', {
                    transType: eventTransType,
                    amount: Math.abs(dto.amount),
                    description: dto.description || transaction.transType,
                    userId: userId,
                    refId: transaction.id,
                    branchCode: account.regionCode
                });
            }
            catch (error) {
                console.error('Failed to emit transaction event:', error);
            }
        }
        return transaction;
    }
    async generateAccountNumber(regionCode) {
        const lastAccount = await this.prisma.anggotaAccount.findFirst({
            where: {
                accountNumber: {
                    startsWith: regionCode
                }
            },
            orderBy: {
                accountNumber: 'desc'
            }
        });
        let sequence = 1;
        if (lastAccount) {
            const withoutRegion = lastAccount.accountNumber.substring(regionCode.length);
            const seqStr = withoutRegion.substring(3);
            const lastSequence = parseInt(seqStr);
            if (!isNaN(lastSequence)) {
                sequence = lastSequence + 1;
            }
        }
        return `${regionCode}ANG${sequence.toString().padStart(5, '0')}`;
    }
    async voidTransaction(transId) {
        return this.prisma.$transaction(async (tx) => {
            const original = await tx.anggotaTransaction.findUnique({
                where: { id: transId }
            });
            if (!original)
                throw new common_1.BadRequestException(`Transaction with ID ${transId} not found`);
            const account = await tx.anggotaAccount.findUnique({
                where: { accountNumber: original.accountNumber }
            });
            if (!account)
                throw new common_1.BadRequestException('Account not found');
            const reversalAmount = Number(original.amount);
            const newBalance = Number(account.balance) - reversalAmount;
            const updateData = {
                balance: newBalance
            };
            if (original.transType === 'SETORAN_POKOK') {
                updateData.principal = Number(account.principal) - reversalAmount;
            }
            await tx.anggotaAccount.update({
                where: { accountNumber: original.accountNumber },
                data: updateData
            });
            return tx.anggotaTransaction.create({
                data: {
                    accountNumber: original.accountNumber,
                    transDate: new Date(),
                    transType: 'KOREKSI',
                    amount: -reversalAmount,
                    balanceAfter: newBalance,
                    description: `VOID/REVERSAL of Trans #${original.id}: ${original.description || ''}`,
                    userId: original.userId,
                }
            });
        });
    }
};
exports.AnggotaService = AnggotaService;
exports.AnggotaService = AnggotaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], AnggotaService);
//# sourceMappingURL=anggota.service.js.map