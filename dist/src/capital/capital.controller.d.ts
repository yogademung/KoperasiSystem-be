import { CapitalService } from './capital.service';
import { CreateModalDto } from './dto/create-modal.dto';
import { TransModalDto } from './dto/trans-modal.dto';
import { CreateExternalLoanDto } from './dto/create-loan.dto';
export declare class CapitalController {
    private readonly capitalService;
    constructor(capitalService: CapitalService);
    createModal(dto: CreateModalDto, req: any): Promise<any>;
    findAllModal(): Promise<any>;
    findOneModal(id: string): Promise<any>;
    addTransaction(id: string, dto: TransModalDto, req: any): Promise<any>;
    createLoan(dto: CreateExternalLoanDto, req: any): Promise<any>;
    findAllLoans(): Promise<any>;
    findOneLoan(id: string): Promise<any>;
}
