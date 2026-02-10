import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    findAll(tableName?: string, recordId?: string, action?: string, userId?: number, page?: number, limit?: number): Promise<{
        items: ({
            user: {
                username: string;
                fullName: string;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            username: string | null;
            tableName: string;
            userId: number | null;
            action: string;
            recordId: string;
            oldValue: string | null;
            newValue: string | null;
            ipAddress: string | null;
            userAgent: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
    }>;
    findOne(id: string): Promise<({
        user: {
            username: string;
            fullName: string;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        username: string | null;
        tableName: string;
        userId: number | null;
        action: string;
        recordId: string;
        oldValue: string | null;
        newValue: string | null;
        ipAddress: string | null;
        userAgent: string | null;
    }) | null>;
}
