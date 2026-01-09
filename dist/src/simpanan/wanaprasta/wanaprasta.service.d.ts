import { PrismaService } from '../../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateWanaprastaDto } from './dto/create-wanaprasta.dto';
import { WanaprastaTransactionDto } from './dto/transaction.dto';
export declare class WanaprastaService {
    private prisma;
    private eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    create(createDto: CreateWanaprastaDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(noWanaprasta: string): Promise<any>;
    setoran(noWanaprasta: string, dto: WanaprastaTransactionDto, userId: number): Promise<any>;
    penarikan(noWanaprasta: string, dto: WanaprastaTransactionDto, userId: number): Promise<any>;
    getTransactions(noWanaprasta: string, page?: number, limit?: number): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    voidTransaction(transId: number, txInput?: any): Promise<any>;
    closeAccount(noWanaprasta: string, dto: {
        reason: string;
        penalty?: number;
        adminFee?: number;
    }, userId: number): Promise<any>;
}
