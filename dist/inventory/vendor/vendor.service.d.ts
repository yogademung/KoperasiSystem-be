import { PrismaService } from 'src/database/prisma.service';
export declare class VendorService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        name: string;
        contactName?: string;
        phone?: string;
        email?: string;
        address?: string;
    }): Promise<{
        id: number;
        createdBy: string | null;
        createdAt: Date;
        name: string;
        email: string | null;
        status: string;
        code: string;
        address: string | null;
        phone: string | null;
        contactName: string | null;
    }>;
    findAll(): Promise<{
        id: number;
        createdBy: string | null;
        createdAt: Date;
        name: string;
        email: string | null;
        status: string;
        code: string;
        address: string | null;
        phone: string | null;
        contactName: string | null;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        createdBy: string | null;
        createdAt: Date;
        name: string;
        email: string | null;
        status: string;
        code: string;
        address: string | null;
        phone: string | null;
        contactName: string | null;
    }>;
    update(id: number, data: any): Promise<{
        id: number;
        createdBy: string | null;
        createdAt: Date;
        name: string;
        email: string | null;
        status: string;
        code: string;
        address: string | null;
        phone: string | null;
        contactName: string | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        createdBy: string | null;
        createdAt: Date;
        name: string;
        email: string | null;
        status: string;
        code: string;
        address: string | null;
        phone: string | null;
        contactName: string | null;
    }>;
    getApAging(): Promise<any[]>;
}
