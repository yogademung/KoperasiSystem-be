// Menu Service - Enhanced with CRUD Permissions

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateMenuDto, UpdateMenuDto, AssignMenusToRoleDto, CopyPermissionsDto } from './dto/menu.dto';

@Injectable()
export class MenuService {
    constructor(private prisma: PrismaService) { }

    /**
     * Get all menus in hierarchical structure
     */
    async getAllMenus() {
        const menus = await this.prisma.menu.findMany({
            where: { isActive: true },
            orderBy: [
                { parentId: 'asc' },
                { orderNum: 'asc' }
            ],
            include: {
                menuRoles: {
                    include: {
                        role: {
                            select: {
                                id: true,
                                roleName: true
                            }
                        }
                    }
                }
            }
        });

        return this.buildMenuTree(menus);
    }

    /**
     * Get menu by ID
     */
    async getMenuById(id: number) {
        const menu = await this.prisma.menu.findUnique({
            where: { id },
            include: {
                menuRoles: {
                    include: {
                        role: true
                    }
                }
            }
        });

        if (!menu) {
            throw new NotFoundException(`Menu with ID ${id} not found`);
        }

        return menu;
    }

    /**
     * Get menus for specific role with CRUD permissions
     */
    async getMenusForRole(roleId: number) {
        const menuRoles = await this.prisma.menuRole.findMany({
            where: { roleId },
            include: {
                menu: true
            },
            orderBy: {
                menu: {
                    orderNum: 'asc'
                }
            }
        });

        const menusWithPermissions = menuRoles.map(mr => ({
            ...mr.menu,
            permissions: {
                canCreate: mr.canCreate,
                canRead: mr.canRead,
                canUpdate: mr.canUpdate,
                canDelete: mr.canDelete,
            }
        }));

        return this.buildMenuTree(menusWithPermissions);
    }

    /**
     * Create new menu
     */
    async createMenu(dto: CreateMenuDto, createdBy: string) {
        // Validate parent exists if parentId provided
        if (dto.parentId) {
            const parent = await this.prisma.menu.findUnique({
                where: { id: dto.parentId }
            });
            if (!parent) {
                throw new BadRequestException(`Parent menu with ID ${dto.parentId} not found`);
            }
        }

        // Get next order number if not provided
        if (dto.orderNum === undefined) {
            const maxOrder = await this.prisma.menu.findFirst({
                where: { parentId: dto.parentId || null },
                orderBy: { orderNum: 'desc' },
                select: { orderNum: true }
            });
            dto.orderNum = (maxOrder?.orderNum || 0) + 1;
        }

        return this.prisma.menu.create({
            data: {
                menuName: dto.menuName,
                module: dto.module,
                node: dto.node,
                parentId: dto.parentId,
                icon: dto.icon,
                path: dto.path,
                orderNum: dto.orderNum,
                isActive: dto.isActive !== undefined ? dto.isActive : true,
                createdBy,
                createdAt: new Date()
            }
        });
    }

    /**
     * Update menu
     */
    async updateMenu(id: number, dto: UpdateMenuDto, updatedBy: string) {
        const existing = await this.prisma.menu.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundException(`Menu with ID ${id} not found`);
        }

        if (dto.parentId !== undefined && dto.parentId !== null) {
            if (dto.parentId === id) {
                throw new BadRequestException('Menu cannot be its own parent');
            }
            const parent = await this.prisma.menu.findUnique({
                where: { id: dto.parentId }
            });
            if (!parent) {
                throw new BadRequestException(`Parent menu with ID ${dto.parentId} not found`);
            }
        }

        return this.prisma.menu.update({
            where: { id },
            data: {
                ...dto,
                updatedBy,
                updatedAt: new Date()
            }
        });
    }

    /**
     * Delete menu (soft delete)
     */
    async deleteMenu(id: number, deletedBy: string) {
        const existing = await this.prisma.menu.findUnique({
            where: { id },
            include: {
                menuRoles: true
            }
        });

        if (!existing) {
            throw new NotFoundException(`Menu with ID ${id} not found`);
        }

        const children = await this.prisma.menu.count({
            where: { parentId: id, isActive: true }
        });

        if (children > 0) {
            throw new BadRequestException(
                'Cannot delete menu with active children. Delete children first or set parentId to null.'
            );
        }

        return this.prisma.menu.update({
            where: { id },
            data: {
                isActive: false,
                updatedBy: deletedBy,
                updatedAt: new Date()
            }
        });
    }

    /**
     * Assign menus to role with CRUD permissions
     */
    async assignMenusToRole(roleId: number, dto: AssignMenusToRoleDto) {
        const role = await this.prisma.role.findUnique({ where: { id: roleId } });
        if (!role) {
            throw new NotFoundException(`Role with ID ${roleId} not found`);
        }

        // Verify all menus exist
        const menuIds = dto.menuPermissions.map(mp => mp.menuId);
        const menus = await this.prisma.menu.findMany({
            where: {
                id: { in: menuIds },
                isActive: true
            }
        });

        if (menus.length !== menuIds.length) {
            throw new BadRequestException('Some menu IDs are invalid or inactive');
        }

        // Delete existing mappings
        await this.prisma.menuRole.deleteMany({
            where: { roleId }
        });

        // Create new mappings with CRUD permissions
        const menuRoles = dto.menuPermissions.map(mp => ({
            roleId,
            menuId: mp.menuId,
            canCreate: mp.canCreate,
            canRead: mp.canRead,
            canUpdate: mp.canUpdate,
            canDelete: mp.canDelete,
        }));

        await this.prisma.menuRole.createMany({
            data: menuRoles
        });

        return {
            success: true,
            message: `Assigned ${dto.menuPermissions.length} menus with permissions to role`
        };
    }

    /**
     * Get menus assigned to role
     */
    async getRoleMenus(roleId: number) {
        const menuRoles = await this.prisma.menuRole.findMany({
            where: { roleId },
            include: {
                menu: true
            }
        });

        return menuRoles.map(mr => ({
            ...mr.menu,
            permissions: {
                canCreate: mr.canCreate,
                canRead: mr.canRead,
                canUpdate: mr.canUpdate,
                canDelete: mr.canDelete,
            }
        }));
    }

    /**
     * Copy permissions from one role to another
     */
    async copyPermissions(dto: CopyPermissionsDto) {
        const { sourceRoleId, targetRoleId, overwriteExisting = false } = dto;

        // Verify both roles exist
        const [sourceRole, targetRole] = await Promise.all([
            this.prisma.role.findUnique({ where: { id: sourceRoleId } }),
            this.prisma.role.findUnique({ where: { id: targetRoleId } })
        ]);

        if (!sourceRole) {
            throw new NotFoundException(`Source role with ID ${sourceRoleId} not found`);
        }
        if (!targetRole) {
            throw new NotFoundException(`Target role with ID ${targetRoleId} not found`);
        }

        // Get source role's menu permissions
        const sourcePermissions = await this.prisma.menuRole.findMany({
            where: { roleId: sourceRoleId }
        });

        if (sourcePermissions.length === 0) {
            throw new BadRequestException('Source role has no menu permissions to copy');
        }

        // Delete existing target permissions if overwrite is true
        if (overwriteExisting) {
            await this.prisma.menuRole.deleteMany({
                where: { roleId: targetRoleId }
            });
        }

        // Copy permissions
        const newPermissions = sourcePermissions.map(sp => ({
            roleId: targetRoleId,
            menuId: sp.menuId,
            canCreate: sp.canCreate,
            canRead: sp.canRead,
            canUpdate: sp.canUpdate,
            canDelete: sp.canDelete,
        }));

        await this.prisma.menuRole.createMany({
            data: newPermissions,
            skipDuplicates: !overwriteExisting
        });

        return {
            success: true,
            message: `Copied ${sourcePermissions.length} menu permissions from ${sourceRole.roleName} to ${targetRole.roleName}`,
            copiedCount: sourcePermissions.length
        };
    }

    /**
     * Build hierarchical menu tree from flat list
     */
    private buildMenuTree(menus: any[]): any[] {
        const menuMap = new Map();
        const roots: any[] = [];

        menus.forEach(menu => {
            menuMap.set(menu.id, { ...menu, children: [] });
        });

        menus.forEach(menu => {
            const node = menuMap.get(menu.id);
            if (menu.parentId === null) {
                roots.push(node);
            } else {
                const parent = menuMap.get(menu.parentId);
                if (parent) {
                    parent.children.push(node);
                }
            }
        });

        return roots;
    }
}
