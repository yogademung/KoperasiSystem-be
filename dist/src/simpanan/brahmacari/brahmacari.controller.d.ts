import { BrahmacariService } from './brahmacari.service';
import { CreateBrahmacariDto } from './dto/create-brahmacari.dto';
import { BrahmacariTransactionDto } from './dto/transaction.dto';
export declare class BrahmacariController {
    private readonly brahmacariService;
    constructor(brahmacariService: BrahmacariService);
    create(createDto: CreateBrahmacariDto, req: any): Promise<any>;
    findAll(): Promise<any>;
    findOne(noBrahmacari: string): Promise<any>;
    setoran(noBrahmacari: string, dto: BrahmacariTransactionDto, req: any): Promise<any>;
    penarikan(noBrahmacari: string, dto: BrahmacariTransactionDto, req: any): Promise<any>;
    getTransactions(noBrahmacari: string, page?: string, limit?: string): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    close(noBrahmacari: string, body: {
        reason: string;
        penalty?: number;
        adminFee?: number;
    }, req: any): Promise<any>;
}
