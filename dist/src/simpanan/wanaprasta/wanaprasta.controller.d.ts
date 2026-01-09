import { WanaprastaService } from './wanaprasta.service';
import { CreateWanaprastaDto } from './dto/create-wanaprasta.dto';
import { WanaprastaTransactionDto } from './dto/transaction.dto';
export declare class WanaprastaController {
    private readonly wanaprastaService;
    constructor(wanaprastaService: WanaprastaService);
    create(createDto: CreateWanaprastaDto, req: any): Promise<any>;
    findAll(): Promise<any>;
    findOne(noWanaprasta: string): Promise<any>;
    setoran(noWanaprasta: string, dto: WanaprastaTransactionDto, req: any): Promise<any>;
    penarikan(noWanaprasta: string, dto: WanaprastaTransactionDto, req: any): Promise<any>;
    getTransactions(noWanaprasta: string, page?: string, limit?: string): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    close(noWanaprasta: string, body: {
        reason: string;
        penalty?: number;
        adminFee?: number;
    }, req: any): Promise<any>;
}
