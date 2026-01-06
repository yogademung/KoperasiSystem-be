import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateAnggotaDto } from './dto/create-anggota.dto';
import { SetoranDto } from './dto/setoran.dto';
import { TutupAnggotaDto } from './dto/tutup-anggota.dto';

@Injectable()
export class AnggotaService {
    constructor(
        private prisma: PrismaService,
        private eventEmitter: EventEmitter2
    ) { }

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
                description: dto.description,
                latitude: dto.latitude,
                longitude: dto.longitude
            }, userId);

            return { success: true };
            return { success: true };
        });
    }

    async closeAccount(
        accountNumber: string,
        dto: TutupAnggotaDto,
        userId: number
    ) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Get Account
            const account = await tx.anggotaAccount.findUnique({
                where: { accountNumber }
            });

            if (!account) {
                throw new BadRequestException('Account not found');
            }

            if (account.status === 'T') {
                throw new BadRequestException('Account is already closed');
            }

            const currentBalance = Number(account.balance);
            let finalBalance = currentBalance;

            // 2. Handle Penalty (Denda)
            if (dto.penaltyAmount && dto.penaltyAmount > 0) {
                await this.createTransaction(tx, accountNumber, {
                    transType: 'DENDA',
                    amount: -dto.penaltyAmount,
                    description: `Penalty: ${dto.reason || 'Account Closure'}`
                }, userId);
                finalBalance -= dto.penaltyAmount;
            }

            // 3. Handle Admin Fee
            if (dto.adminFee && dto.adminFee > 0) {
                await this.createTransaction(tx, accountNumber, {
                    transType: 'BIAYA_ADMIN',
                    amount: -dto.adminFee,
                    description: `Admin Fee: ${dto.reason || 'Account Closure'}`
                }, userId);
                finalBalance -= dto.adminFee;
            }

            // 4. Final Disbursement (TUTUP)
            // Even if balance is 0 or negative (should not be), we might need to record the closing.
            // Assuming balance > 0 for disbursement.
            if (finalBalance > 0) {
                await this.createTransaction(tx, accountNumber, {
                    transType: 'TUTUP',
                    amount: -finalBalance,
                    description: `Closing Account: ${dto.reason || ''}`
                }, userId);
            }

            // 5. Update Status
            await tx.anggotaAccount.update({
                where: { accountNumber },
                data: {
                    status: 'T',
                    closeDate: new Date(),
                    balance: 0 // Ensure it's explicitly 0
                }
            });

            return {
                success: true,
                refundAmount: finalBalance,
                message: 'Account closed successfully'
            };
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
    private async createTransaction(tx: any, accountNumber: string, dto: { transType: string, amount: number, description?: string, latitude?: number, longitude?: number }, userId: number) {
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
                latitude: dto.latitude,
                longitude: dto.longitude
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

        // EMIT EVENT
        // Map Anggota transTypes to standardized event keys
        let eventTransType = '';
        if (dto.transType === 'SETORAN_POKOK') eventTransType = 'ANGGOTA_SETOR_POKOK';
        else if (dto.transType === 'SETORAN_WAJIB') eventTransType = 'ANGGOTA_SETOR_WAJIB';
        else if (dto.transType === 'SETORAN') eventTransType = 'ANGGOTA_SETOR_SUKARELA';
        else if (dto.transType === 'PENARIKAN') eventTransType = 'ANGGOTA_TARIK';
        else if (dto.transType === 'DENDA') eventTransType = 'ANGGOTA_DENDA';
        else if (dto.transType === 'BIAYA_ADMIN') eventTransType = 'ANGGOTA_ADMIN';
        else if (dto.transType === 'TUTUP') eventTransType = 'ANGGOTA_TUTUP';

        if (eventTransType) {
            try {
                this.eventEmitter.emit('transaction.created', {
                    transType: eventTransType,
                    amount: Math.abs(dto.amount), // Always positive for amount field
                    description: dto.description || transaction.transType,
                    userId: userId,
                    refId: transaction.id,
                    branchCode: account.regionCode // Use regionCode as branch placeholder
                });
            } catch (error) {
                console.error('Failed to emit transaction event:', error);
                // Do not throw, allow transaction to complete
            }
        }

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

    /**
     * Void/Reverse a transaction
     */
    async voidTransaction(transId: number, txInput?: any) {
        // Helper to execute logic with a transaction client
        const executeLogic = async (tx: any) => {
            // 1. Find Original Transaction
            const original = await tx.anggotaTransaction.findUnique({
                where: { id: transId }
            });

            if (!original) throw new BadRequestException(`Transaction with ID ${transId} not found`);

            // 2. Get Account
            const account = await tx.anggotaAccount.findUnique({
                where: { accountNumber: original.accountNumber }
            });

            if (!account) throw new BadRequestException('Account not found');

            // 3. Reverse Logic
            // Original: Balance = Old + Amount.
            // Reversal: Balance = Current - Amount.
            const reversalAmount = Number(original.amount); // Positive for Deposit, Negative for Withdrawal
            const newBalance = Number(account.balance) - reversalAmount;

            const updateData: any = {
                balance: newBalance
            };

            // If it was Setoran Pokok, reverse Principal too
            if (original.transType === 'SETORAN_POKOK') {
                updateData.principal = Number(account.principal) - reversalAmount;
            }

            // 4. Update Account
            await tx.anggotaAccount.update({
                where: { accountNumber: original.accountNumber },
                data: updateData
            });

            // 5. Create Reversal Transaction
            return tx.anggotaTransaction.create({
                data: {
                    accountNumber: original.accountNumber,
                    transDate: new Date(),
                    transType: 'KOREKSI', // Generic correction type
                    amount: -reversalAmount, // Opposite of original
                    balanceAfter: newBalance,
                    description: `VOID/REVERSAL of Trans #${original.id}: ${original.description || ''}`,
                    userId: original.userId,
                    latitude: original.latitude, // Keep original geo if you want, or null
                    longitude: original.longitude
                }
            });
        };

        if (txInput) {
            return executeLogic(txInput);
        } else {
            return this.prisma.$transaction(executeLogic);
        }
    }
}
