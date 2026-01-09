import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export interface CreateCostCenterDto {
    code: string;
    name: string;
    description?: string;
    parentId?: number;
    businessUnitId?: number;
    managerId?: number;
    budget?: number;
}

export interface UpdateCostCenterDto {
    name?: string;
    description?: string;
    parentId?: number;
    businessUnitId?: number;
    managerId?: number;
    budget?: number;
    isActive?: boolean;
}

export interface CostCenterFilters {
    search?: string;
    parentId?: number;
    businessUnitId?: number;
    managerId?: number;
    isActive?: boolean;
}

@Injectable()
export class CostCenterService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateCostCenterDto, userId: number) {
        // Validate parent if provided
        if (dto.parentId) {
            const parent = await this.prisma.costCenter.findUnique({
                where: { id: dto.parentId },
            });
            if (!parent) {
                throw new NotFoundException('Parent cost center not found');
            }
        }

        // Check code uniqueness
        const existing = await this.prisma.costCenter.findUnique({
            where: { code: dto.code },
        });
        if (existing) {
            throw new BadRequestException('Cost center code already exists');
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

    async findAll(filters: CostCenterFilters = {}) {
        const where: any = {};

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
            orderBy: [
                { code: 'asc' },
            ],
        });

        return {
            data: costCenters,
            total: costCenters.length,
        };
    }

    async findOne(id: number) {
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
            throw new NotFoundException('Cost center not found');
        }

        return costCenter;
    }

    async update(id: number, dto: UpdateCostCenterDto) {
        // Check existence
        const existing = await this.findOne(id);

        // Validate parent if changed
        if (dto.parentId !== undefined && dto.parentId !== existing.parentId) {
            if (dto.parentId === id) {
                throw new BadRequestException('Cost center cannot be its own parent');
            }

            if (dto.parentId) {
                const parent = await this.prisma.costCenter.findUnique({
                    where: { id: dto.parentId },
                });
                if (!parent) {
                    throw new NotFoundException('Parent cost center not found');
                }

                // Check for circular reference
                const isDescendant = await this.isDescendantOf(dto.parentId, id);
                if (isDescendant) {
                    throw new BadRequestException('Cannot create circular reference in hierarchy');
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

    async delete(id: number) {
        // Check if has children
        const children = await this.prisma.costCenter.count({
            where: { parentId: id },
        });

        if (children > 0) {
            throw new BadRequestException('Cannot delete cost center with children');
        }

        return this.prisma.costCenter.delete({
            where: { id },
        });
    }

    async getChildren(id: number) {
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

    async getTree(rootId?: number) {
        const where = rootId ? { parentId: rootId } : { parentId: null };

        const buildTree = async (parentId: number | null): Promise<any[]> => {
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

            return Promise.all(
                nodes.map(async (node) => ({
                    ...node,
                    children: await buildTree(node.id),
                }))
            );
        };

        return buildTree(rootId || null);
    }

    private async isDescendantOf(childId: number, ancestorId: number): Promise<boolean> {
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

    async getBudgetStatus(id: number, year: number, month?: number) {
        const costCenter = await this.findOne(id);

        // TODO: Calculate actual expenses from journal entries
        // For now, return budget info
        return {
            costCenterId: id,
            budget: costCenter.budget,
            actual: 0, // Will be calculated from posted_journal_detail
            variance: costCenter.budget ? Number(costCenter.budget) : 0,
            utilizationPercent: 0,
        };
    }
}
