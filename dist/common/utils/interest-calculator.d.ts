export type InterestPeriod = 'DAILY' | 'MONTHLY' | 'YEARLY' | null;
interface InterestCalculationParams {
    balance: number;
    annualRatePercent: number;
    period: InterestPeriod;
    days?: number;
    months?: number;
    years?: number;
}
export declare function calculateInterest(params: InterestCalculationParams): number;
export declare function calculateInterestForDateRange(balance: number, annualRatePercent: number, period: InterestPeriod, startDate: Date, endDate?: Date): number;
export declare function getPeriodRate(annualRatePercent: number, period: InterestPeriod): number;
export declare function estimateAnnualInterest(balance: number, annualRatePercent: number, period: InterestPeriod): number;
export {};
