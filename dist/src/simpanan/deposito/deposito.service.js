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
exports.DepositoService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let DepositoService = class DepositoService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createDto, userId) {
        const { nasabahId, nominal, jangkaWaktuBulan, bunga, keterangan } = createDto;
        const nasabah = await this.prisma.nasabah.findUnique({
            where: { id: nasabahId },
        });
        if (!nasabah)
            throw new common_1.NotFoundException('Nasabah not found');
        const date = new Date();
        const yearMonth = date.toISOString().slice(0, 7).replace('-', '');
        const random = Math.floor(1000 + Math.random() * 9000);
        const noJangka = `J-${yearMonth}-${random}`;
        const tglBuka = new Date();
        const tglJatuhTempo = new Date(tglBuka);
        tglJatuhTempo.setMonth(tglJatuhTempo.getMonth() + jangkaWaktuBulan);
        return this.prisma.$transaction(async (tx) => {
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
                    status: 'A',
                    createdBy: userId.toString(),
                },
            });
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
    async findOne(noJangka) {
        const deposito = await this.prisma.nasabahJangka.findUnique({
            where: { noJangka },
            include: {
                nasabah: true,
                transactions: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!deposito)
            throw new common_1.NotFoundException('Deposito not found');
        const accumulatedInterest = deposito.transactions
            .filter(t => t.tipeTrans === 'BUNGA')
            .reduce((sum, t) => sum + Number(t.nominal), 0);
        return {
            ...deposito,
            accumulatedInterest
        };
    }
    async withdraw(noJangka, userId) {
        const deposito = await this.prisma.nasabahJangka.findUnique({
            where: { noJangka },
        });
        if (!deposito)
            throw new common_1.NotFoundException('Deposito not found');
        if (deposito.status !== 'A')
            throw new common_1.BadRequestException('Deposito is not active');
        return this.prisma.$transaction(async (tx) => {
            await tx.transJangka.create({
                data: {
                    noJangka,
                    tipeTrans: 'CAIR',
                    nominal: deposito.nominal.negated(),
                    keterangan: 'Pencairan Deposito',
                    createdBy: userId.toString(),
                },
            });
            return tx.nasabahJangka.update({
                where: { noJangka },
                data: {
                    status: 'C',
                    updatedBy: userId.toString(),
                },
            });
        });
    }
};
exports.DepositoService = DepositoService;
exports.DepositoService = DepositoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DepositoService);
//# sourceMappingURL=deposito.service.js.map