import { PrismaService } from '../../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateAnggotaDto } from './dto/create-anggota.dto';
import { SetoranDto } from './dto/setoran.dto';
import { TutupAnggotaDto } from './dto/tutup-anggota.dto';
export declare class AnggotaService {
    private prisma;
    private eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    create(dto: CreateAnggotaDto, userId: number): Promise<any>;
    findAll(): Promise<any>;
    findOne(accountNumber: string): Promise<any>;
    setoran(accountNumber: string, dto: SetoranDto, userId: number): Promise<any>;
    penarikan(accountNumber: string, dto: SetoranDto, userId: number): Promise<any>;
    closeAccount(accountNumber: string, dto: TutupAnggotaDto, userId: number): Promise<any>;
    getTransactions(accountNumber: string, page?: number, limit?: number): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    private createTransaction;
    private generateAccountNumber;
    voidTransaction(transId: number, txInput?: any): Promise<any>;
}
