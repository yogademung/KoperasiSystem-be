/**
 * Interest Calculation Utility
 * Calculates interest based on configured period (DAILY, MONTHLY, YEARLY)
 */

export type InterestPeriod = 'DAILY' | 'MONTHLY' | 'YEARLY' | null;

interface InterestCalculationParams {
    balance: number;           // Saldo (in KiloIDR or full, depends on context)
    annualRatePercent: number; // Interest rate in percent (e.g., 5 for 5%)
    period: InterestPeriod;    // Calculation period
    days?: number;             // Number of days (for DAILY calculation)
    months?: number;           // Number of months (for MONTHLY calculation)
    years?: number;            // Number of years (for YEARLY calculation)
}

/**
 * Calculate interest based on period configuration
 * 
 * Formula:
 * - DAILY:   balance * (annualRate / 365) * days
 * - MONTHLY: balance * (annualRate / 12) * months
 * - YEARLY:  balance * annualRate * years
 * 
 * @param params - Calculation parameters
 * @returns Calculated interest amount
 */
export function calculateInterest(params: InterestCalculationParams): number {
    const { balance, annualRatePercent, period, days = 1, months = 1, years = 1 } = params;

    if (!period) {
        throw new Error('Interest period not configured');
    }

    if (balance <= 0 || annualRatePercent <= 0) {
        return 0;
    }

    const annualRate = annualRatePercent / 100;

    switch (period) {
        case 'DAILY':
            // Daily interest: (balance * annual rate) / 365 * number of days
            return (balance * annualRate / 365) * days;

        case 'MONTHLY':
            // Monthly interest: (balance * annual rate) / 12 * number of months
            return (balance * annualRate / 12) * months;

        case 'YEARLY':
            // Yearly interest: balance * annual rate * number of years
            return balance * annualRate * years;

        default:
            throw new Error(`Unsupported interest period: ${period}`);
    }
}

/**
 * Calculate interest for a specific date range
 * Automatically detects the appropriate time unit based on period
 * 
 * @param balance - Account balance
 * @param annualRatePercent - Annual interest rate (%)
 * @param period - Calculation period
 * @param startDate - Start date
 * @param endDate - End date (default: today)
 * @returns Calculated interest amount
 */
export function calculateInterestForDateRange(
    balance: number,
    annualRatePercent: number,
    period: InterestPeriod,
    startDate: Date,
    endDate: Date = new Date()
): number {
    if (!period) {
        throw new Error('Interest period not configured');
    }

    const diffMs = endDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    switch (period) {
        case 'DAILY':
            return calculateInterest({
                balance,
                annualRatePercent,
                period,
                days: diffDays,
            });

        case 'MONTHLY':
            // Approximate months (30.44 days per month average)
            const months = diffDays / 30.44;
            return calculateInterest({
                balance,
                annualRatePercent,
                period,
                months,
            });

        case 'YEARLY':
            // Approximate years (365.25 days per year)
            const years = diffDays / 365.25;
            return calculateInterest({
                balance,
                annualRatePercent,
                period,
                years,
            });

        default:
            throw new Error(`Unsupported interest period: ${period}`);
    }
}

/**
 * Get interest rate for a specific period
 * Useful for displaying rates in UI
 * 
 * @param annualRatePercent - Annual rate in percent
 * @param period - Calculation period
 * @returns Period-specific rate
 */
export function getPeriodRate(annualRatePercent: number, period: InterestPeriod): number {
    if (!period) {
        return 0;
    }

    const annualRate = annualRatePercent / 100;

    switch (period) {
        case 'DAILY':
            return (annualRate / 365) * 100;
        case 'MONTHLY':
            return (annualRate / 12) * 100;
        case 'YEARLY':
            return annualRatePercent;
        default:
            return 0;
    }
}

/**
 * Estimate annual interest for display purposes
 * Shows what user will earn in one year
 * 
 * @param balance - Current balance
 * @param annualRatePercent - Annual rate
 * @param period - Calculation period
 * @returns Estimated annual interest
 */
export function estimateAnnualInterest(
    balance: number,
    annualRatePercent: number,
    period: InterestPeriod
): number {
    if (!period) {
        return 0;
    }

    // All periods ultimately calculate annual interest the same way
    const annualRate = annualRatePercent / 100;
    return balance * annualRate;
}
