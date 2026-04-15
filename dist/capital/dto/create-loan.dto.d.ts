export declare class CreateExternalLoanDto {
    bankName: string;
    contractNumber: string;
    loanDate: string;
    maturityDate: string;
    principal: number;
    interestRate: number;
    termMonths: number;
    installmentType: 'ANUITAS' | 'FLAT';
}
