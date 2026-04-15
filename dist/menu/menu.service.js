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
exports.MenuService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let MenuService = class MenuService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllMenus() {
        const menus = await this.prisma.menu.findMany({
            where: { isActive: true },
            orderBy: [{ parentId: 'asc' }, { orderNum: 'asc' }],
            include: {
                menuRoles: {
                    include: {
                        role: {
                            select: {
                                id: true,
                                roleName: true,
                            },
                        },
                    },
                },
            },
        });
        return this.buildMenuTree(menus);
    }
    async getMenuById(id) {
        const menu = await this.prisma.menu.findUnique({
            where: { id },
            include: {
                menuRoles: {
                    include: {
                        role: true,
                    },
                },
            },
        });
        if (!menu) {
            throw new common_1.NotFoundException(`Menu with ID ${id} not found`);
        }
        return menu;
    }
    async getMenusForRole(roleId) {
        const menuRoles = await this.prisma.menuRole.findMany({
            where: { roleId },
            include: {
                menu: true,
            },
            orderBy: {
                menu: {
                    orderNum: 'asc',
                },
            },
        });
        const menusWithPermissions = menuRoles.map((mr) => ({
            ...mr.menu,
            permissions: {
                canCreate: mr.canCreate,
                canRead: mr.canRead,
                canUpdate: mr.canUpdate,
                canDelete: mr.canDelete,
            },
        }));
        return this.buildMenuTree(menusWithPermissions);
    }
    async createMenu(dto, createdBy) {
        if (dto.parentId) {
            const parent = await this.prisma.menu.findUnique({
                where: { id: dto.parentId },
            });
            if (!parent) {
                throw new common_1.BadRequestException(`Parent menu with ID ${dto.parentId} not found`);
            }
        }
        if (dto.orderNum === undefined) {
            const maxOrder = await this.prisma.menu.findFirst({
                where: { parentId: dto.parentId || null },
                orderBy: { orderNum: 'desc' },
                select: { orderNum: true },
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
                createdAt: new Date(),
            },
        });
    }
    async updateMenu(id, dto, updatedBy) {
        const existing = await this.prisma.menu.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException(`Menu with ID ${id} not found`);
        }
        if (dto.parentId !== undefined && dto.parentId !== null) {
            if (dto.parentId === id) {
                throw new common_1.BadRequestException('Menu cannot be its own parent');
            }
            const parent = await this.prisma.menu.findUnique({
                where: { id: dto.parentId },
            });
            if (!parent) {
                throw new common_1.BadRequestException(`Parent menu with ID ${dto.parentId} not found`);
            }
        }
        return this.prisma.menu.update({
            where: { id },
            data: {
                ...dto,
                updatedBy,
                updatedAt: new Date(),
            },
        });
    }
    async deleteMenu(id, deletedBy) {
        const existing = await this.prisma.menu.findUnique({
            where: { id },
            include: {
                menuRoles: true,
            },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Menu with ID ${id} not found`);
        }
        const children = await this.prisma.menu.count({
            where: { parentId: id, isActive: true },
        });
        if (children > 0) {
            throw new common_1.BadRequestException('Cannot delete menu with active children. Delete children first or set parentId to null.');
        }
        return this.prisma.menu.update({
            where: { id },
            data: {
                isActive: false,
                updatedBy: deletedBy,
                updatedAt: new Date(),
            },
        });
    }
    async assignMenusToRole(roleId, dto) {
        const role = await this.prisma.role.findUnique({ where: { id: roleId } });
        if (!role) {
            throw new common_1.NotFoundException(`Role with ID ${roleId} not found`);
        }
        const menuIds = dto.menuPermissions.map((mp) => mp.menuId);
        const menus = await this.prisma.menu.findMany({
            where: {
                id: { in: menuIds },
                isActive: true,
            },
        });
        if (menus.length !== menuIds.length) {
            throw new common_1.BadRequestException('Some menu IDs are invalid or inactive');
        }
        await this.prisma.menuRole.deleteMany({
            where: { roleId },
        });
        const menuRoles = dto.menuPermissions.map((mp) => ({
            roleId,
            menuId: mp.menuId,
            canCreate: mp.canCreate,
            canRead: mp.canRead,
            canUpdate: mp.canUpdate,
            canDelete: mp.canDelete,
        }));
        await this.prisma.menuRole.createMany({
            data: menuRoles,
        });
        return {
            success: true,
            message: `Assigned ${dto.menuPermissions.length} menus with permissions to role`,
        };
    }
    async getRoleMenus(roleId) {
        const menuRoles = await this.prisma.menuRole.findMany({
            where: { roleId },
            include: {
                menu: true,
            },
        });
        return menuRoles.map((mr) => ({
            ...mr.menu,
            permissions: {
                canCreate: mr.canCreate,
                canRead: mr.canRead,
                canUpdate: mr.canUpdate,
                canDelete: mr.canDelete,
            },
        }));
    }
    async copyPermissions(dto) {
        const { sourceRoleId, targetRoleId, overwriteExisting = false } = dto;
        const [sourceRole, targetRole] = await Promise.all([
            this.prisma.role.findUnique({ where: { id: sourceRoleId } }),
            this.prisma.role.findUnique({ where: { id: targetRoleId } }),
        ]);
        if (!sourceRole) {
            throw new common_1.NotFoundException(`Source role with ID ${sourceRoleId} not found`);
        }
        if (!targetRole) {
            throw new common_1.NotFoundException(`Target role with ID ${targetRoleId} not found`);
        }
        const sourcePermissions = await this.prisma.menuRole.findMany({
            where: { roleId: sourceRoleId },
        });
        if (sourcePermissions.length === 0) {
            throw new common_1.BadRequestException('Source role has no menu permissions to copy');
        }
        if (overwriteExisting) {
            await this.prisma.menuRole.deleteMany({
                where: { roleId: targetRoleId },
            });
        }
        const newPermissions = sourcePermissions.map((sp) => ({
            roleId: targetRoleId,
            menuId: sp.menuId,
            canCreate: sp.canCreate,
            canRead: sp.canRead,
            canUpdate: sp.canUpdate,
            canDelete: sp.canDelete,
        }));
        await this.prisma.menuRole.createMany({
            data: newPermissions,
            skipDuplicates: !overwriteExisting,
        });
        return {
            success: true,
            message: `Copied ${sourcePermissions.length} menu permissions from ${sourceRole.roleName} to ${targetRole.roleName}`,
            copiedCount: sourcePermissions.length,
        };
    }
    buildMenuTree(menus) {
        const menuMap = new Map();
        const roots = [];
        menus.forEach((menu) => {
            menuMap.set(menu.id, { ...menu, children: [] });
        });
        menus.forEach((menu) => {
            const node = menuMap.get(menu.id);
            if (menu.parentId === null) {
                roots.push(node);
            }
            else {
                const parent = menuMap.get(menu.parentId);
                if (parent) {
                    parent.children.push(node);
                }
            }
        });
        return roots;
    }
};
exports.MenuService = MenuService;
exports.MenuService = MenuService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MenuService);
//# sourceMappingURL=menu.service.js.map