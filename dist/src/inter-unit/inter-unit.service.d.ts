import { PrismaService } from '../database/prisma.service';
import { InterUnitTransactionStatus, InterUnitTransactionType } from '@prisma/client';
import { AccountingService } from '../accounting/accounting.service';
export interface CreateInterUnitTransactionDto {
    transactionDate: Date;
    sourceUnitId: number;
    destUnitId: number;
    amount: number;
    description?: string;
    transactionType: InterUnitTransactionType;
}
export interface InterUnitTransactionFilters {
    startDate?: Date;
    endDate?: Date;
    sourceUnitId?: number;
    destUnitId?: number;
    status?: InterUnitTransactionStatus;
    page?: number;
    limit?: number;
}
export declare class InterUnitService {
    private prisma;
    private accountingService;
    constructor(prisma: PrismaService, accountingService: AccountingService);
    generateReferenceNumber(date?: Date): Promise<string>;
    create(dto: CreateInterUnitTransactionDto, userId: number): Promise<any>;
    findAll(filters: InterUnitTransactionFilters): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: number): Promise<any>;
    approve(id: number, userId: number): Promise<any>;
    post(id: number, userId: number): Promise<any>;
    getBalances(unitId: number, asOfDate?: Date): Promise<{
        unitId: number;
        balance: number;
        type: string;
    }[]>;
    generateElimination(year: number, month: number, userId: number): Promise<any>;
    delete(id: number): Promise<any>;
}
