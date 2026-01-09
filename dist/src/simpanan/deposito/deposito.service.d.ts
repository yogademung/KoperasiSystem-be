import { PrismaService } from '../../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateDepositoDto } from './dto/create-deposito.dto';
export declare class DepositoService {
    private prisma;
    private eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    create(createDto: CreateDepositoDto, userId: number): Promise<any>;
    findAll(): Promise<any>;
    getTransactions(noJangka: string, page?: number, limit?: number): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    voidTransaction(transId: number, txInput?: any): Promise<any>;
    findOne(noJangka: string): Promise<any>;
    withdraw(noJangka: string, userId: number, options?: {
        penalty?: number;
        adminFee?: number;
        reason?: string;
    }): Promise<any>;
}
