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
        orderNum: number | null;
        code: string;
        codeValue: string;
    }>;
    getLastClosingMonth(): Promise<string | null>;
    setLastClosingMonth(period: string, userId: string): Promise<{
        description: string | null;
        updatedAt: Date | null;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        orderNum: number | null;
        code: string;
        codeValue: string;
    }>;
}
