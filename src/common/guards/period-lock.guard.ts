import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PeriodLockService } from '../../month-end/period-lock.service';

@Injectable()
export class PeriodLockGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private periodLockService: PeriodLockService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const method = request.method;

        // Only check for mutation methods
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            // Try to find a date in the body to check against
            // Assumes body has 'journalDate' or 'date' or 'period'
            const body = request.body;
            let dateToCheck = body.journalDate || body.date || body.transactionDate;

            if (dateToCheck) {
                const dateObj = new Date(dateToCheck);
                if (!isNaN(dateObj.getTime())) {
                    const period = dateObj.toISOString().slice(0, 7); // YYYY-MM
                    const isLocked = await this.periodLockService.isPeriodLocked(period);

                    if (isLocked) {
                        throw new BadRequestException(`Period ${period} is LOCKED. Cannot modify transactions.`);
                    }
                }
            }
        }

        return true;
    }
}
