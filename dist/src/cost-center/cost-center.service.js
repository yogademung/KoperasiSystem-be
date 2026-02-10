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
exports.CostCenterService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let CostCenterService = class CostCenterService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, userId) {
        if (dto.parentId) {
            const parent = await this.prisma.costCenter.findUnique({
                where: { id: dto.parentId },
            });
            if (!parent) {
                throw new common_1.NotFoundException('Parent cost center not found');
            }
        }
        const existing = await this.prisma.costCenter.findUnique({
            where: { code: dto.code },
        });
        if (existing) {
            throw new common_1.BadRequestException('Cost center code already exists');
        }
        return this.prisma.costCenter.create({
            data: {
                ...dto,
                budget: dto.budget ? dto.budget : undefined,
                createdBy: userId,
            },
            include: {
                parent: true,
                manager: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                    },
                },
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
            },
        });
    }
    async findAll(filters = {}) {
        const where = {};
        if (filters.search) {
            where.OR = [
                { code: { contains: filters.search } },
                { name: { contains: filters.search } },
            ];
        }
        if (filters.parentId !== undefined) {
            where.parentId = filters.parentId;
        }
        if (filters.businessUnitId) {
            where.businessUnitId = filters.businessUnitId;
        }
        if (filters.managerId) {
            where.managerId = filters.managerId;
        }
        if (filters.isActive !== undefined) {
            where.isActive = filters.isActive;
        }
        const costCenters = await this.prisma.costCenter.findMany({
            where,
            include: {
                parent: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
                manager: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                    },
                },
                _count: {
                    select: {
                        children: true,
                    },
                },
            },
            orderBy: [{ code: 'asc' }],
        });
        return {
            data: costCenters,
            total: costCenters.length,
        };
    }
    async findOne(id) {
        const costCenter = await this.prisma.costCenter.findUnique({
            where: { id },
            include: {
                parent: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
                children: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        isActive: true,
                    },
                },
                manager: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                        staffId: true,
                    },
                },
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
            },
        });
        if (!costCenter) {
            throw new common_1.NotFoundException('Cost center not found');
        }
        return costCenter;
    }
    async update(id, dto) {
        const existing = await this.findOne(id);
        if (dto.parentId !== undefined && dto.parentId !== existing.parentId) {
            if (dto.parentId === id) {
                throw new common_1.BadRequestException('Cost center cannot be its own parent');
            }
            if (dto.parentId) {
                const parent = await this.prisma.costCenter.findUnique({
                    where: { id: dto.parentId },
                });
                if (!parent) {
                    throw new common_1.NotFoundException('Parent cost center not found');
                }
                const isDescendant = await this.isDescendantOf(dto.parentId, id);
                if (isDescendant) {
                    throw new common_1.BadRequestException('Cannot create circular reference in hierarchy');
                }
            }
        }
        return this.prisma.costCenter.update({
            where: { id },
            data: {
                ...dto,
                budget: dto.budget !== undefined ? dto.budget : undefined,
            },
            include: {
                parent: true,
                manager: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                    },
                },
            },
        });
    }
    async delete(id) {
        const children = await this.prisma.costCenter.count({
            where: { parentId: id },
        });
        if (children > 0) {
            throw new common_1.BadRequestException('Cannot delete cost center with children');
        }
        return this.prisma.costCenter.delete({
            where: { id },
        });
    }
    async getChildren(id) {
        const costCenter = await this.findOne(id);
        return this.prisma.costCenter.findMany({
            where: { parentId: id },
            include: {
                manager: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
                _count: {
                    select: {
                        children: true,
                    },
                },
            },
            orderBy: { code: 'asc' },
        });
    }
    async getTree(rootId) {
        const where = rootId ? { parentId: rootId } : { parentId: null };
        const buildTree = async (parentId) => {
            const nodes = await this.prisma.costCenter.findMany({
                where: { parentId },
                include: {
                    manager: {
                        select: {
                            id: true,
                            fullName: true,
                        },
                    },
                },
                orderBy: { code: 'asc' },
            });
            return Promise.all(nodes.map(async (node) => ({
                ...node,
                children: await buildTree(node.id),
            })));
        };
        return buildTree(rootId || null);
    }
    async isDescendantOf(childId, ancestorId) {
        const child = await this.prisma.costCenter.findUnique({
            where: { id: childId },
            select: { parentId: true },
        });
        if (!child || !child.parentId) {
            return false;
        }
        if (child.parentId === ancestorId) {
            return true;
        }
        return this.isDescendantOf(child.parentId, ancestorId);
    }
    async getBudgetStatus(id, year, month) {
        const costCenter = await this.findOne(id);
        return {
            costCenterId: id,
            budget: costCenter.budget,
            actual: 0,
            variance: costCenter.budget ? Number(costCenter.budget) : 0,
            utilizationPercent: 0,
        };
    }
};
exports.CostCenterService = CostCenterService;
exports.CostCenterService = CostCenterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CostCenterService);
//# sourceMappingURL=cost-center.service.js.map