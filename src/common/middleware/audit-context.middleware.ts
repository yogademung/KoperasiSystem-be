import { Injectable, NestMiddleware } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { Request, Response, NextFunction } from 'express';

export interface AuditContext {
  userId?: number;
  username?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditContextMiddleware implements NestMiddleware {
  static storage = new AsyncLocalStorage<AuditContext>();

  use(req: Request, res: Response, next: NextFunction) {
    const user = (req as any).user;

    const context: AuditContext = {
      userId: user?.id,
      username: user?.username,
      ipAddress: req.ip || req.headers['x-forwarded-for']?.toString(),
      userAgent: req.headers['user-agent'],
    };

    AuditContextMiddleware.storage.run(context, () => {
      next();
    });
  }
}
