import { PrismaService } from '../../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateBalimesariDto } from './dto/create-balimesari.dto';
import { BalimesariTransactionDto } from './dto/transaction.dto';
export declare class BalimesariService {
    private prisma;
    private eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    create(createDto: CreateBalimesariDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(noBalimesari: string): Promise<any>;
    setoran(noBalimesari: string, dto: BalimesariTransactionDto, userId: number): Promise<any>;
    penarikan(noBalimesari: string, dto: BalimesariTransactionDto, userId: number): Promise<any>;
    getTransactions(noBalimesari: string, page?: number, limit?: number): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    voidTransaction(transId: number, txInput?: any): Promise<any>;
    closeAccount(noBalimesari: string, dto: {
        reason: string;
        penalty?: number;
        adminFee?: number;
    }, userId: number): Promise<any>;
}
