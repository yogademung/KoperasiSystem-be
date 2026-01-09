import { AnggotaService } from './anggota.service';
import { CreateAnggotaDto } from './dto/create-anggota.dto';
import { SetoranDto } from './dto/setoran.dto';
import { TutupAnggotaDto } from './dto/tutup-anggota.dto';
export declare class AnggotaController {
    private readonly anggotaService;
    constructor(anggotaService: AnggotaService);
    create(dto: CreateAnggotaDto, req: any): Promise<any>;
    findAll(): Promise<any>;
    findOne(accountNumber: string): Promise<any>;
    setoran(accountNumber: string, dto: SetoranDto, req: any): Promise<any>;
    penarikan(accountNumber: string, dto: SetoranDto, req: any): Promise<any>;
    getTransactions(accountNumber: string, page?: number, limit?: number): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    tutup(accountNumber: string, dto: TutupAnggotaDto, req: any): Promise<any>;
}
