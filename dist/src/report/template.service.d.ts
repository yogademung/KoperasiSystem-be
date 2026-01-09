import { PrismaService } from '../database/prisma.service';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/report.dto';
export declare class TemplateService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(filters?: {
        productModule?: string;
        category?: string;
        isDefault?: boolean;
    }): Promise<any>;
    findOne(id: number): Promise<any>;
    findByCode(code: string): Promise<any>;
    create(dto: CreateTemplateDto, userId: string): Promise<any>;
    update(id: number, dto: UpdateTemplateDto, userId: string): Promise<any>;
    delete(id: number, userId: string): Promise<any>;
    createVersion(parentId: number, name: string, userId: string): Promise<any>;
    private validateTemplateSchema;
}
