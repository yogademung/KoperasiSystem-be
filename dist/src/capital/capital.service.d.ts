import { PrismaService } from '../database/prisma.service';
import { CreateModalDto } from './dto/create-modal.dto';
import { TransModalDto } from './dto/trans-modal.dto';
import { CreateExternalLoanDto } from './dto/create-loan.dto';
import { AccountingService } from '../accounting/accounting.service';
export declare class CapitalService {
    private prisma;
    private accountingService;
    constructor(prisma: PrismaService, accountingService: AccountingService);
    createNasabahModal(dto: CreateModalDto, userId: number): Promise<any>;
    findAllNasabahModal(): Promise<any>;
    findOneNasabahModal(id: string): Promise<any>;
    addModalTransaction(accountNumber: string, dto: TransModalDto, userId: number): Promise<any>;
    private createModalTransaction;
    private generateModalAccountNumber;
    createExternalLoan(dto: CreateExternalLoanDto, userId: number): Promise<any>;
    findAllExternalLoans(): Promise<any>;
    findOneExternalLoan(id: number): Promise<any>;
}
