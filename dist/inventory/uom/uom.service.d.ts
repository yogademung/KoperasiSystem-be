import { PrismaService } from 'src/database/prisma.service';
export declare class UomService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        code: string;
        name: string;
    }): Promise<{
        id: number;
        isActive: boolean;
        name: string;
        code: string;
    }>;
    findAll(): Promise<{
        id: number;
        isActive: boolean;
        name: string;
        code: string;
    }[]>;
    update(id: number, data: {
        code?: string;
        name?: string;
        isActive?: boolean;
    }): Promise<{
        id: number;
        isActive: boolean;
        name: string;
        code: string;
    }>;
    remove(id: number): Promise<{
        id: number;
        isActive: boolean;
        name: string;
        code: string;
    }>;
}
