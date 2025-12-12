import { AccountingService } from '../accounting.service';
export declare class AccountingListener {
    private accountingService;
    constructor(accountingService: AccountingService);
    handleTransactionCreatedEvent(payload: {
        transType: string;
        amount: number;
        description: string;
        userId: number;
        refId?: number;
        wilayahCd?: string;
        branchCode?: string;
    }): Promise<void>;
}
