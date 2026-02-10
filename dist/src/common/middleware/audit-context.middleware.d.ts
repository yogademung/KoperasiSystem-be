import { NestMiddleware } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { Request, Response, NextFunction } from 'express';
export interface AuditContext {
    userId?: number;
    username?: string;
    ipAddress?: string;
    userAgent?: string;
}
export declare class AuditContextMiddleware implements NestMiddleware {
    static storage: AsyncLocalStorage<AuditContext>;
    use(req: Request, res: Response, next: NextFunction): void;
}
