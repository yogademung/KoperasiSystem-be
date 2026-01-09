import { BalimesariService } from './balimesari.service';
import { CreateBalimesariDto } from './dto/create-balimesari.dto';
import { BalimesariTransactionDto } from './dto/transaction.dto';
export declare class BalimesariController {
    private readonly balimesariService;
    constructor(balimesariService: BalimesariService);
    create(createDto: CreateBalimesariDto, req: any): Promise<any>;
    findAll(): Promise<any>;
    findOne(noBalimesari: string): Promise<any>;
    setoran(noBalimesari: string, dto: BalimesariTransactionDto, req: any): Promise<any>;
    penarikan(noBalimesari: string, dto: BalimesariTransactionDto, req: any): Promise<any>;
    getTransactions(noBalimesari: string, page?: string, limit?: string): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    close(noBalimesari: string, body: {
        reason: string;
        penalty?: number;
        adminFee?: number;
    }, req: any): Promise<any>;
}
