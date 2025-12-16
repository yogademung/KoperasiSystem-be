import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/report.dto';
import { TemplateSchema } from './interfaces/report.interfaces';

@Injectable()
export class TemplateService {
    constructor(private prisma: PrismaService) { }

    async findAll(filters?: {
        productModule?: string;
        category?: string;
        isDefault?: boolean;
    }) {
        return this.prisma.reportTemplate.findMany({
            where: {
                isActive: true,
                ...(filters?.productModule && { productModule: filters.productModule }),
                ...(filters?.category && { category: filters.category }),
                ...(filters?.isDefault !== undefined && { isDefault: filters.isDefault }),
            },
            select: {
                id: true,
                code: true,
                name: true,
                description: true,
                productModule: true,
                category: true,
                version: true,
                isDefault: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: [
                { productModule: 'asc' },
                { code: 'asc' },
            ],
        });
    }

    async findOne(id: number) {
        const template = await this.prisma.reportTemplate.findUnique({
            where: { id },
            include: {
                parent: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
                versions: {
                    where: { isActive: true },
                    select: {
                        id: true,
                        version: true,
                        name: true,
                        createdAt: true,
                    },
                },
            },
        });

        if (!template) {
            throw new NotFoundException(`Template with ID ${id} not found`);
        }

        return template;
    }

    async findByCode(code: string) {
        const template = await this.prisma.reportTemplate.findUnique({
            where: { code },
        });

        if (!template) {
            throw new NotFoundException(`Template with code ${code} not found`);
        }

        return template;
    }

    async create(dto: CreateTemplateDto, userId: string) {
        // Validate JSON schema
        this.validateTemplateSchema(dto.jsonSchema);

        // Check if code already exists
        const existing = await this.prisma.reportTemplate.findUnique({
            where: { code: dto.code },
        });

        if (existing) {
            throw new BadRequestException(`Template with code ${dto.code} already exists`);
        }

        return this.prisma.reportTemplate.create({
            data: {
                code: dto.code,
                name: dto.name,
                description: dto.description,
                productModule: dto.productModule,
                category: dto.category,
                jsonSchema: dto.jsonSchema as any,
                paperSize: dto.paperSize || 'A4',
                orientation: dto.orientation || 'portrait',
                parentId: dto.parentId,
                createdBy: userId,
                updatedBy: userId,
            },
        });
    }

    async update(id: number, dto: UpdateTemplateDto, userId: string) {
        const template = await this.findOne(id);

        // If updating JSON schema, validate it
        if (dto.jsonSchema) {
            this.validateTemplateSchema(dto.jsonSchema);
        }

        return this.prisma.reportTemplate.update({
            where: { id },
            data: {
                ...(dto.name && { name: dto.name }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.jsonSchema && { jsonSchema: dto.jsonSchema as any }),
                ...(dto.isActive !== undefined && { isActive: dto.isActive }),
                updatedBy: userId,
            },
        });
    }

    async delete(id: number, userId: string) {
        const template = await this.findOne(id);

        // Soft delete by setting isActive to false
        return this.prisma.reportTemplate.update({
            where: { id },
            data: {
                isActive: false,
                updatedBy: userId,
            },
        });
    }

    async createVersion(parentId: number, name: string, userId: string) {
        const parent = await this.findOne(parentId);

        // Get the latest version number
        const latestVersion = await this.prisma.reportTemplate.findFirst({
            where: {
                OR: [
                    { id: parentId },
                    { parentId: parentId },
                ],
            },
            orderBy: { version: 'desc' },
        });

        const newVersion = (latestVersion?.version || 0) + 1;

        return this.prisma.reportTemplate.create({
            data: {
                code: `${parent.code}_V${newVersion}`,
                name: name || `${parent.name} (Version ${newVersion})`,
                description: parent.description,
                productModule: parent.productModule,
                category: parent.category,
                jsonSchema: parent.jsonSchema,
                paperSize: parent.paperSize,
                orientation: parent.orientation,
                marginTop: parent.marginTop,
                marginBottom: parent.marginBottom,
                marginLeft: parent.marginLeft,
                marginRight: parent.marginRight,
                version: newVersion,
                parentId: parentId,
                createdBy: userId,
                updatedBy: userId,
            },
        });
    }

    private validateTemplateSchema(schema: any): void {
        if (!schema || typeof schema !== 'object') {
            throw new BadRequestException('Invalid template schema: must be an object');
        }

        const templateSchema = schema as TemplateSchema;

        if (!templateSchema.version) {
            throw new BadRequestException('Invalid template schema: version is required');
        }

        if (!templateSchema.paperSize) {
            throw new BadRequestException('Invalid template schema: paperSize is required');
        }

        if (!templateSchema.orientation) {
            throw new BadRequestException('Invalid template schema: orientation is required');
        }

        if (!Array.isArray(templateSchema.elements)) {
            throw new BadRequestException('Invalid template schema: elements must be an array');
        }

        // Validate each element
        for (const element of templateSchema.elements) {
            if (!element.id || !element.type) {
                throw new BadRequestException('Invalid template element: id and type are required');
            }

            if (typeof element.x !== 'number' || typeof element.y !== 'number') {
                throw new BadRequestException('Invalid template element: x and y must be numbers');
            }

            // Sanitize text content to prevent XSS
            if (element.type === 'text' && element.content) {
                // Basic sanitization - remove HTML tags
                element.content = element.content.replace(/<[^>]*>/g, '');
            }
        }
    }
}
