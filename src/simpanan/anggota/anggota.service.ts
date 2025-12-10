import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAnggotaDto } from './dto/create-anggota.dto';
import { SetoranDto } from './dto/setoran.dto';

@Injectable()
export class AnggotaService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateAnggotaDto, userId: number) {
        // Generate account number
        const accountNumber = await this.generateAccountNumber(dto.regionCode);

        // Check if account number already exists
        const existing = await this.prisma.anggotaAccount.findUnique({
            where: { accountNumber }
        });

        if (existing) {
            throw new BadRequestException('Account number already exists');
        }

        // Create account
        // Using transaction to ensure account and initial transactions are created together
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

            // Create initial transaction for principal
            if (dto.principal > 0) {
                await this.createTransaction(tx, accountNumber, {
                    transType: 'SETORAN_POKOK',
                    amount: dto.principal,
                }, userId);
            }

            // Create initial transaction for mandatory
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

    async findOne(accountNumber: string) {
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
            throw new BadRequestException('Account not found');
        }

        return account;
    }

    async setoran(
        accountNumber: string,
        dto: SetoranDto,
        userId: number
    ) {
        return this.prisma.$transaction(async (tx) => {
            // Get account
            const account = await tx.anggotaAccount.findUnique({
                where: { accountNumber }
            });

            if (!account) {
                throw new BadRequestException('Account not found');
            }

            if (account.status !== 'A' && account.status !== 'D') {
                throw new BadRequestException('Account is not active');
            }

            // Update account balance
            // Note: Setoran Pokok usually doesn't increase withdrawable balance in some systems,
            // but here we follow the prompt's logic where it goes to 'balance' or we might 
            // need to update 'principal' field if it is Setoran Pokok.
            // The prompt code updated 'balance'. However, Setoran Pokok increases equity.
            // Let's stick to prompt logic: Update Balance.

            await this.createTransaction(tx, accountNumber, dto, userId);

            // Activate account if D
            if (account.status === 'D') {
                await tx.anggotaAccount.update({
                    where: { accountNumber },
                    data: { status: 'A' }
                })
            }

            return { success: true };
        });
    }

    async penarikan(
        accountNumber: string,
        dto: SetoranDto, // Reusing SetoranDto or use PenarikanDto
        userId: number
    ) {
        return this.prisma.$transaction(async (tx) => {
            // Get account
            const account = await tx.anggotaAccount.findUnique({
                where: { accountNumber }
            });

            if (!account) {
                throw new BadRequestException('Account not found');
            }

            if (account.status !== 'A') {
                throw new BadRequestException('Account is not active');
            }

            const currentBalance = Number(account.balance);
            if (currentBalance < dto.amount) {
                throw new BadRequestException('Insufficient balance');
            }

            // Create transaction (Debit - Negative Amount)
            await this.createTransaction(tx, accountNumber, {
                transType: 'PENARIKAN',
                amount: -Math.abs(dto.amount), // Ensure negative
                description: dto.description
            }, userId);

            return { success: true };
        });
    }

    async getTransactions(
        accountNumber: string,
        page: number = 1,
        limit: number = 10
    ) {
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

    // Helper to create transaction and update balance
    private async createTransaction(tx: any, accountNumber: string, dto: { transType: string, amount: number, description?: string }, userId: number) {
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

        const updateData: any = {
            balance: newBalance
        };

        // Also update principal field if it is Setoran Pokok
        if (dto.transType === 'SETORAN_POKOK') {
            updateData.principal = Number(account.principal) + dto.amount;
        }

        await tx.anggotaAccount.update({
            where: { accountNumber },
            data: updateData
        });

        return transaction;
    }

    private async generateAccountNumber(regionCode: string): Promise<string> {
        // Get last account number for this region
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
            // Extract sequence from last account number
            // Format: {REGION}ANG{SEQUENCE}
            // Example: 01ANG00001
            // Remove region code first
            const withoutRegion = lastAccount.accountNumber.substring(regionCode.length);
            // Remove 'ANG' (3 chars)
            const seqStr = withoutRegion.substring(3);
            const lastSequence = parseInt(seqStr);
            if (!isNaN(lastSequence)) {
                sequence = lastSequence + 1;
            }
        }

        // Format: {REGION_CODE}ANG{SEQUENCE} (e.g., 01ANG00001)
        return `${regionCode}ANG${sequence.toString().padStart(5, '0')}`;
    }
}
