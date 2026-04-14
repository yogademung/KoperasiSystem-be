import { PrismaService } from 'src/database/prisma.service';
export declare class WarehouseService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        code: string;
        name: string;
        address?: string;
    }): Promise<{
        id: number;
        name: string;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        code: string;
        address: string | null;
    }>;
    findAll(): Promise<{
        id: number;
        name: string;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        code: string;
        address: string | null;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        name: string;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        code: string;
        address: string | null;
    }>;
    update(id: number, data: any): Promise<{
        id: number;
        name: string;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        code: string;
        address: string | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        code: string;
        address: string | null;
    }>;
}
