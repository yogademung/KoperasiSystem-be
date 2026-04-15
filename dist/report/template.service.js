"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let TemplateService = class TemplateService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        return this.prisma.reportTemplate.findMany({
            where: {
                isActive: true,
                ...(filters?.productModule && { productModule: filters.productModule }),
                ...(filters?.category && { category: filters.category }),
                ...(filters?.isDefault !== undefined && {
                    isDefault: filters.isDefault,
                }),
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
            orderBy: [{ productModule: 'asc' }, { code: 'asc' }],
        });
    }
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Template with ID ${id} not found`);
        }
        return template;
    }
    async findByCode(code) {
        const template = await this.prisma.reportTemplate.findUnique({
            where: { code },
        });
        if (!template) {
            throw new common_1.NotFoundException(`Template with code ${code} not found`);
        }
        return template;
    }
    async create(dto, userId) {
        this.validateTemplateSchema(dto.jsonSchema);
        const existing = await this.prisma.reportTemplate.findUnique({
            where: { code: dto.code },
        });
        if (existing) {
            throw new common_1.BadRequestException(`Template with code ${dto.code} already exists`);
        }
        return this.prisma.reportTemplate.create({
            data: {
                code: dto.code,
                name: dto.name,
                description: dto.description,
                productModule: dto.productModule,
                category: dto.category,
                jsonSchema: JSON.stringify(dto.jsonSchema),
                paperSize: dto.paperSize || 'A4',
                orientation: dto.orientation || 'portrait',
                parentId: dto.parentId,
                createdBy: userId,
                updatedBy: userId,
            },
        });
    }
    async update(id, dto, userId) {
        const template = await this.findOne(id);
        if (dto.jsonSchema) {
            this.validateTemplateSchema(dto.jsonSchema);
        }
        return this.prisma.reportTemplate.update({
            where: { id },
            data: {
                ...(dto.name && { name: dto.name }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.jsonSchema && { jsonSchema: JSON.stringify(dto.jsonSchema) }),
                ...(dto.isActive !== undefined && { isActive: dto.isActive }),
                updatedBy: userId,
            },
        });
    }
    async delete(id, userId) {
        const template = await this.findOne(id);
        return this.prisma.reportTemplate.update({
            where: { id },
            data: {
                isActive: false,
                updatedBy: userId,
            },
        });
    }
    async createVersion(parentId, name, userId) {
        const parent = await this.findOne(parentId);
        const latestVersion = await this.prisma.reportTemplate.findFirst({
            where: {
                OR: [{ id: parentId }, { parentId: parentId }],
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
    validateTemplateSchema(schema) {
        if (!schema || typeof schema !== 'object') {
            throw new common_1.BadRequestException('Invalid template schema: must be an object');
        }
        const templateSchema = schema;
        if (!templateSchema.version) {
            throw new common_1.BadRequestException('Invalid template schema: version is required');
        }
        if (!templateSchema.paperSize) {
            throw new common_1.BadRequestException('Invalid template schema: paperSize is required');
        }
        if (!templateSchema.orientation) {
            throw new common_1.BadRequestException('Invalid template schema: orientation is required');
        }
        if (!Array.isArray(templateSchema.elements)) {
            throw new common_1.BadRequestException('Invalid template schema: elements must be an array');
        }
        for (const element of templateSchema.elements) {
            if (!element.id || !element.type) {
                throw new common_1.BadRequestException('Invalid template element: id and type are required');
            }
            if (typeof element.x !== 'number' || typeof element.y !== 'number') {
                throw new common_1.BadRequestException('Invalid template element: x and y must be numbers');
            }
            if (element.type === 'text' && element.content) {
                element.content = element.content.replace(/<[^>]*>/g, '');
            }
        }
    }
};
exports.TemplateService = TemplateService;
exports.TemplateService = TemplateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TemplateService);
//# sourceMappingURL=template.service.js.map