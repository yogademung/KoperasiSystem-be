import { PrismaService } from '../database/prisma.service';
import { CreateBusinessUnitDto, UpdateBusinessUnitDto } from './dto/business-unit.dto';
export declare class BusinessUnitService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        description: string | null;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        createdAt: Date;
        code: string;
    }[]>;
    findActive(): Promise<{
        id: number;
        description: string | null;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        createdAt: Date;
        code: string;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        description: string | null;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        createdAt: Date;
        code: string;
    } | null>;
    create(dto: CreateBusinessUnitDto): Promise<{
        id: number;
        description: string | null;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        createdAt: Date;
        code: string;
    }>;
    update(id: number, dto: UpdateBusinessUnitDto): Promise<{
        id: number;
        description: string | null;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        createdAt: Date;
        code: string;
    }>;
    delete(id: number): Promise<{
        id: number;
        description: string | null;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        createdAt: Date;
        code: string;
    }>;
}
