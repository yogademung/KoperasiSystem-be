import { Injectable, BadRequestException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateModalDto } from './dto/create-modal.dto';
import { TransModalDto } from './dto/trans-modal.dto';
import { CreateExternalLoanDto } from './dto/create-loan.dto';
import { AccountingService } from '../accounting/accounting.service';

@Injectable()
export class CapitalService {
    constructor(
        private prisma: PrismaService,
        @Inject(forwardRef(() => AccountingService))
        private accountingService: AccountingService
    ) { }

    // ============================================
    // MODAL PENYERTAAN (MEMBER CAPITAL)
    // ============================================

    async createNasabahModal(dto: CreateModalDto, userId: number) {
        // Validation: Check if nasabah exists
        const nasabah = await this.prisma.nasabah.findUnique({ where: { id: dto.nasabahId } });
        if (!nasabah) throw new NotFoundException('Nasabah not found');

        const accountNumber = await this.generateModalAccountNumber(dto.regionCode || '01');

        return this.prisma.$transaction(async (tx) => {
            const client = tx as any; // Cast to any to avoid type errors
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
                    transType: 'MODAL_SETOR' as any,
                    amount: dto.initialDeposit,
                    description: 'Setoran Awal Modal Penyertaan'
                }, userId);
            }

            return account;
        });
    }

    async findAllNasabahModal() {
        return (this.prisma as any).nasabahModal.findMany({
            include: { nasabah: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOneNasabahModal(id: string) {
        const account = await (this.prisma as any).nasabahModal.findUnique({
            where: { noRekModal: id },
            include: {
                nasabah: true,
                transactions: {
                    orderBy: { transDate: 'desc' }
                }
            }
        });
        if (!account) throw new NotFoundException('Modal account not found');
        return account;
    }

    async addModalTransaction(accountNumber: string, dto: TransModalDto, userId: number) {
        return this.prisma.$transaction(async (tx) => {
            return this.createModalTransaction(tx, accountNumber, dto, userId);
        });
    }

    private async createModalTransaction(tx: any, accountNumber: string, dto: TransModalDto, userId: number) {
        // tx is already any orTransactionClient, but casting helps if models missing
        const client = tx as any;
        const account = await client.nasabahModal.findUnique({ where: { noRekModal: accountNumber } });
        if (!account) throw new NotFoundException('Account not found');

        let newBalance = Number(account.saldo);
        let type: string = dto.transType;

        // Map simplified types to COA mapping keys
        if (type === 'SETORAN') type = 'MODAL_SETOR';
        if (type === 'PENARIKAN') type = 'MODAL_TARIK';
        if (type === 'SHU') type = 'MODAL_SHU';

        if (type === 'MODAL_SETOR' || type === 'MODAL_SHU') {
            newBalance += Number(dto.amount);
        } else if (type === 'MODAL_TARIK') {
            if (newBalance < dto.amount) throw new BadRequestException('Insufficient balance');
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

        // AUTO POST JOURNAL
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

    private async generateModalAccountNumber(regionCode: string): Promise<string> {
        return (this.prisma as any).nasabahModal.findFirst({
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

    // ============================================
    // EXTERNAL LOAN (PINJAMAN BANK)
    // ============================================

    async createExternalLoan(dto: CreateExternalLoanDto, userId: number) {
        return this.prisma.$transaction(async (tx) => {
            const client = tx as any;
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

            // Generate Schedule 
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

            // Accounting: LOAN_DISBURSE
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
        return (this.prisma as any).externalLoan.findMany({
            include: { schedule: true },
            orderBy: { loanDate: 'desc' }
        });
    }

    async findOneExternalLoan(id: number) {
        const loan = await (this.prisma as any).externalLoan.findUnique({
            where: { id },
            include: { schedule: { orderBy: { installmentNumber: 'asc' } } }
        });
        if (!loan) throw new NotFoundException('Loan not found');
        return loan;
    }
}
