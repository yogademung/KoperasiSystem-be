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
let BalimesariService = class BalimesariService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
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
                }
            });
            if (createDto.setoranAwal && createDto.setoranAwal > 0) {
                await tx.transBalimesari.create({
                    data: {
                        noBalimesari,
                        tipeTrans: 'SETORAN',
                        nominal: createDto.setoranAwal,
                        saldoAkhir: createDto.setoranAwal,
                        keterangan: createDto.keterangan || 'Setoran Awal Pembukaan Rekening Bali Mesari',
                        createdBy: 'SYSTEM'
                    }
                });
            }
            return balimesari;
        });
    }
    async findAll() {
        return this.prisma.nasabahBalimesari.findMany({
            include: {
                nasabah: {
                    select: { nama: true, noKtp: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findOne(noBalimesari) {
        const account = await this.prisma.nasabahBalimesari.findUnique({
            where: { noBalimesari },
            include: {
                nasabah: true,
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 20
                }
            }
        });
        if (!account) {
            throw new common_1.NotFoundException('Rekening Bali Mesari tidak ditemukan');
        }
        return account;
    }
    async setoran(noBalimesari, dto) {
        return this.prisma.$transaction(async (tx) => {
            const account = await tx.nasabahBalimesari.findUnique({
                where: { noBalimesari }
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
                    createdBy: 'SYSTEM'
                }
            });
            await tx.nasabahBalimesari.update({
                where: { noBalimesari },
                data: { saldo: newBalance }
            });
            return transaction;
        });
    }
    async penarikan(noBalimesari, dto) {
        return this.prisma.$transaction(async (tx) => {
            const account = await tx.nasabahBalimesari.findUnique({
                where: { noBalimesari }
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
                    createdBy: 'SYSTEM'
                }
            });
            await tx.nasabahBalimesari.update({
                where: { noBalimesari },
                data: { saldo: newBalance }
            });
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
                take: limit
            }),
            this.prisma.transBalimesari.count({
                where: { noBalimesari }
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
};
exports.BalimesariService = BalimesariService;
exports.BalimesariService = BalimesariService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BalimesariService);
//# sourceMappingURL=balimesari.service.js.map