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
        name: string;
        createdBy: string | null;
        createdAt: Date;
        code: string;
        status: string;
        email: string | null;
        address: string | null;
        phone: string | null;
        contactName: string | null;
    }>;
    findAll(): Promise<{
        id: number;
        name: string;
        createdBy: string | null;
        createdAt: Date;
        code: string;
        status: string;
        email: string | null;
        address: string | null;
        phone: string | null;
        contactName: string | null;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        name: string;
        createdBy: string | null;
        createdAt: Date;
        code: string;
        status: string;
        email: string | null;
        address: string | null;
        phone: string | null;
        contactName: string | null;
    }>;
    update(id: number, data: any): Promise<{
        id: number;
        name: string;
        createdBy: string | null;
        createdAt: Date;
        code: string;
        status: string;
        email: string | null;
        address: string | null;
        phone: string | null;
        contactName: string | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        createdBy: string | null;
        createdAt: Date;
        code: string;
        status: string;
        email: string | null;
        address: string | null;
        phone: string | null;
        contactName: string | null;
    }>;
    getApAging(): Promise<any[]>;
}
