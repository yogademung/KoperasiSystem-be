import { PrismaService } from '../../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateTabrelaDto } from './dto/create-tabrela.dto';
export declare class TabrelaService {
    private prisma;
    private eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    create(createDto: CreateTabrelaDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(noTab: string): Promise<any>;
    setoran(noTab: string, dto: {
        amount: number;
        description?: string;
        transType?: string;
    }, userId?: any): Promise<any>;
    penarikan(noTab: string, dto: {
        amount: number;
        description?: string;
    }, userId?: any): Promise<any>;
    voidTransaction(transId: number, txInput?: any): Promise<any>;
    closeAccount(noTab: string, dto: {
        reason: string;
        penalty?: number;
        adminFee?: number;
    }, userId?: number): Promise<any>;
}
