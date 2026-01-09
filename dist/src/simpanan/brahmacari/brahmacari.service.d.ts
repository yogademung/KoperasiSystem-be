import { PrismaService } from '../../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateBrahmacariDto } from './dto/create-brahmacari.dto';
import { BrahmacariTransactionDto } from './dto/transaction.dto';
export declare class BrahmacariService {
    private prisma;
    private eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    create(createDto: CreateBrahmacariDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(noBrahmacari: string): Promise<any>;
    setoran(noBrahmacari: string, dto: BrahmacariTransactionDto, userId: number): Promise<any>;
    penarikan(noBrahmacari: string, dto: BrahmacariTransactionDto, userId: number): Promise<any>;
    getTransactions(noBrahmacari: string, page?: number, limit?: number): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    voidTransaction(transId: number, txInput?: any): Promise<any>;
    closeAccount(noBrahmacari: string, dto: {
        reason: string;
        penalty?: number;
        adminFee?: number;
    }, userId: number): Promise<any>;
}
