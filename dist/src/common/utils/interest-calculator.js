"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateInterest = calculateInterest;
exports.calculateInterestForDateRange = calculateInterestForDateRange;
exports.getPeriodRate = getPeriodRate;
exports.estimateAnnualInterest = estimateAnnualInterest;
function calculateInterest(params) {
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
            return (balance * annualRate / 365) * days;
        case 'MONTHLY':
            return (balance * annualRate / 12) * months;
        case 'YEARLY':
            return balance * annualRate * years;
        default:
            throw new Error(`Unsupported interest period: ${period}`);
    }
}
function calculateInterestForDateRange(balance, annualRatePercent, period, startDate, endDate = new Date()) {
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
            const months = diffDays / 30.44;
            return calculateInterest({
                balance,
                annualRatePercent,
                period,
                months,
            });
        case 'YEARLY':
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
function getPeriodRate(annualRatePercent, period) {
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
function estimateAnnualInterest(balance, annualRatePercent, period) {
    if (!period) {
        return 0;
    }
    const annualRate = annualRatePercent / 100;
    return balance * annualRate;
}
//# sourceMappingURL=interest-calculator.js.map