import { PrismaService } from '../database/prisma.service';
export declare class LovValueService {
    private prisma;
    constructor(prisma: PrismaService);
    getValue(code: string, codeValue: string): Promise<string | null>;
    setValue(code: string, codeValue: string, description: string, userId: string): Promise<{
        description: string | null;
        updatedAt: Date | null;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        code: string;
        codeValue: string;
        orderNum: number | null;
    }>;
    getLastClosingMonth(): Promise<string | null>;
    setLastClosingMonth(period: string, userId: string): Promise<{
        description: string | null;
        updatedAt: Date | null;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        code: string;
        codeValue: string;
        orderNum: number | null;
    }>;
}
