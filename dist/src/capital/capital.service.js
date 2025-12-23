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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapitalService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const accounting_service_1 = require("../accounting/accounting.service");
let CapitalService = class CapitalService {
    prisma;
    accountingService;
    constructor(prisma, accountingService) {
        this.prisma = prisma;
        this.accountingService = accountingService;
    }
    async createNasabahModal(dto, userId) {
        const nasabah = await this.prisma.nasabah.findUnique({ where: { id: dto.nasabahId } });
        if (!nasabah)
            throw new common_1.NotFoundException('Nasabah not found');
        const accountNumber = await this.generateModalAccountNumber(dto.regionCode || '01');
        return this.prisma.$transaction(async (tx) => {
            const client = tx;
            const account = await client.nasabahModal.create({
                data: {
                    noRekModal: accountNumber,
                    nasabahId: dto.nasabahId,
                    tglBuka: new Date(),
                    saldo: 0,
                    status: 'A',
                    wilayahCd: dto.regionCode,
                    createdBy: userId.toString(),
                },
                include: { nasabah: true }
            });
            if (dto.initialDeposit > 0) {
                await this.createModalTransaction(tx, accountNumber, {
                    transType: 'MODAL_SETOR',
                    amount: dto.initialDeposit,
                    description: 'Setoran Awal Modal Penyertaan'
                }, userId);
            }
            return account;
        });
    }
    async findAllNasabahModal() {
        return this.prisma.nasabahModal.findMany({
            include: { nasabah: true },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findOneNasabahModal(id) {
        const account = await this.prisma.nasabahModal.findUnique({
            where: { noRekModal: id },
            include: {
                nasabah: true,
                transactions: {
                    orderBy: { transDate: 'desc' }
                }
            }
        });
        if (!account)
            throw new common_1.NotFoundException('Modal account not found');
        return account;
    }
    async addModalTransaction(accountNumber, dto, userId) {
        return this.prisma.$transaction(async (tx) => {
            return this.createModalTransaction(tx, accountNumber, dto, userId);
        });
    }
    async createModalTransaction(tx, accountNumber, dto, userId) {
        const client = tx;
        const account = await client.nasabahModal.findUnique({ where: { noRekModal: accountNumber } });
        if (!account)
            throw new common_1.NotFoundException('Account not found');
        let newBalance = Number(account.saldo);
        let type = dto.transType;
        if (type === 'SETORAN')
            type = 'MODAL_SETOR';
        if (type === 'PENARIKAN')
            type = 'MODAL_TARIK';
        if (type === 'SHU')
            type = 'MODAL_SHU';
        if (type === 'MODAL_SETOR' || type === 'MODAL_SHU') {
            newBalance += Number(dto.amount);
        }
        else if (type === 'MODAL_TARIK') {
            if (newBalance < dto.amount)
                throw new common_1.BadRequestException('Insufficient balance');
            newBalance -= Number(dto.amount);
        }
        const trans = await client.transModal.create({
            data: {
                noRekModal: accountNumber,
                tipeTrans: type,
                nominal: dto.amount,
                saldoAkhir: newBalance,
                keterangan: dto.description,
                createdBy: userId.toString(),
                transDate: new Date()
            }
        });
        await client.nasabahModal.update({
            where: { noRekModal: accountNumber },
            data: { saldo: newBalance }
        });
        await this.accountingService.autoPostJournal({
            transType: type,
            amount: Number(dto.amount),
            description: dto.description || `Transaksi Modal ${type}`,
            userId: userId,
            refId: trans.id,
            wilayahCd: account.wilayahCd
        }, tx);
        return trans;
    }
    async generateModalAccountNumber(regionCode) {
        return this.prisma.nasabahModal.findFirst({
            where: { noRekModal: { startsWith: regionCode + 'MDL' } },
            orderBy: { noRekModal: 'desc' }
        }).then(last => {
            let seq = 1;
            if (last) {
                const numPart = last.noRekModal.substring((regionCode + 'MDL').length);
                seq = parseInt(numPart) + 1;
            }
            return `${regionCode}MDL${seq.toString().padStart(5, '0')}`;
        });
    }
    async createExternalLoan(dto, userId) {
        return this.prisma.$transaction(async (tx) => {
            const client = tx;
            const loan = await client.externalLoan.create({
                data: {
                    bankName: dto.bankName,
                    contractNumber: dto.contractNumber,
                    loanDate: new Date(dto.loanDate),
                    maturityDate: new Date(dto.maturityDate),
                    principal: dto.principal,
                    interestRate: dto.interestRate,
                    termMonths: dto.termMonths,
                    installmentType: dto.installmentType,
                    monthlyInstallment: 0,
                    outstandingPrincipal: dto.principal,
                    status: 'ACTIVE',
                    createdBy: userId.toString()
                }
            });
            const principalPerMonth = Number(dto.principal) / dto.termMonths;
            const interestPerMonth = (Number(dto.principal) * (Number(dto.interestRate) / 100)) / 12;
            let currentDate = new Date(dto.loanDate);
            for (let i = 1; i <= dto.termMonths; i++) {
                currentDate.setMonth(currentDate.getMonth() + 1);
                await client.installmentSchedule.create({
                    data: {
                        loanId: loan.id,
                        installmentNumber: i,
                        dueDate: new Date(currentDate),
                        principalDue: principalPerMonth,
                        interestDue: interestPerMonth,
                        totalDue: principalPerMonth + interestPerMonth,
                        status: 'DUE'
                    }
                });
            }
            await this.accountingService.autoPostJournal({
                transType: 'LOAN_DISBURSE',
                amount: Number(dto.principal),
                description: `Pencairan Pinjaman Bank ${dto.bankName} - Kontrak ${dto.contractNumber}`,
                userId: userId,
                refId: loan.id
            }, tx);
            return loan;
        });
    }
    async findAllExternalLoans() {
        return this.prisma.externalLoan.findMany({
            include: { schedule: true },
            orderBy: { loanDate: 'desc' }
        });
    }
    async findOneExternalLoan(id) {
        const loan = await this.prisma.externalLoan.findUnique({
            where: { id },
            include: { schedule: { orderBy: { installmentNumber: 'asc' } } }
        });
        if (!loan)
            throw new common_1.NotFoundException('Loan not found');
        return loan;
    }
};
exports.CapitalService = CapitalService;
exports.CapitalService = CapitalService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => accounting_service_1.AccountingService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        accounting_service_1.AccountingService])
], CapitalService);
//# sourceMappingURL=capital.service.js.map