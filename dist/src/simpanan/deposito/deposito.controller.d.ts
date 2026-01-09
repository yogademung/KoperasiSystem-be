import { DepositoService } from './deposito.service';
import { CreateDepositoDto } from './dto/create-deposito.dto';
import { SimpananInterestService } from '../simpanan-interest.service';
export declare class DepositoController {
    private readonly depositoService;
    private readonly interestService;
    constructor(depositoService: DepositoService, interestService: SimpananInterestService);
    testInterest(): Promise<{
        message: string;
    }>;
    getSimulation(noJangka: string): Promise<{
        noJangka: any;
        nama: any;
        nominal: any;
        rate: any;
        grossInterest: number;
        tax: number;
        netInterest: number;
        payoutMode: any;
        targetAccountId: any;
    }>;
    findAll(): Promise<any>;
    findOne(noJangka: string): Promise<any>;
    create(createDto: CreateDepositoDto, req: any): Promise<any>;
    withdraw(noJangka: string, body: {
        penalty?: number;
        adminFee?: number;
        reason?: string;
    }, req: any): Promise<any>;
}
