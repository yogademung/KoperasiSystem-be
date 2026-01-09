import { InterUnitService, CreateInterUnitTransactionDto, InterUnitTransactionFilters } from './inter-unit.service';
export declare class InterUnitController {
    private readonly interUnitService;
    constructor(interUnitService: InterUnitService);
    createTransaction(dto: CreateInterUnitTransactionDto): Promise<any>;
    getTransactions(filters: InterUnitTransactionFilters): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getTransaction(id: number): Promise<any>;
    approveTransaction(id: number): Promise<any>;
    postTransaction(id: number): Promise<any>;
    deleteTransaction(id: number): Promise<any>;
    getBalances(unitId: number, asOfDate?: string): Promise<{
        unitId: number;
        balance: number;
        type: string;
    }[]>;
    generateElimination(year: number, month: number): Promise<any>;
}
