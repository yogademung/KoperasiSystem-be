import { TabrelaService } from './tabrela.service';
import { CreateTabrelaDto } from './dto/create-tabrela.dto';
export declare class TabrelaController {
    private readonly tabrelaService;
    constructor(tabrelaService: TabrelaService);
    create(createDto: CreateTabrelaDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(noTab: string): Promise<any>;
    setoran(noTab: string, body: any): Promise<any>;
    penarikan(noTab: string, body: any): Promise<any>;
    close(noTab: string, body: {
        reason: string;
        penalty?: number;
        adminFee?: number;
    }): Promise<any>;
}
