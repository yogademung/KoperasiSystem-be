import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PeriodLockService } from '../../month-end/period-lock.service';
export declare class PeriodLockGuard implements CanActivate {
    private reflector;
    private periodLockService;
    constructor(reflector: Reflector, periodLockService: PeriodLockService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
