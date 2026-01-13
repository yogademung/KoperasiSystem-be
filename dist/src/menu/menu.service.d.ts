import { PrismaService } from '../database/prisma.service';
import { CreateMenuDto, UpdateMenuDto, AssignMenusToRoleDto, CopyPermissionsDto } from './dto/menu.dto';
export declare class MenuService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllMenus(): Promise<any[]>;
    getMenuById(id: number): Promise<{
        menuRoles: ({
            role: {
                id: number;
                description: string | null;
                updatedAt: Date | null;
                isActive: boolean;
                createdBy: string | null;
                createdAt: Date;
                updatedBy: string | null;
                roleName: string;
            };
        } & {
            roleId: number;
            menuId: number;
            canCreate: boolean;
            canRead: boolean;
            canUpdate: boolean;
            canDelete: boolean;
        })[];
    } & {
        id: number;
        module: string | null;
        updatedAt: Date | null;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        path: string | null;
        orderNum: number | null;
        menuName: string;
        node: string | null;
        parentId: number | null;
        icon: string | null;
    }>;
    getMenusForRole(roleId: number): Promise<any[]>;
    createMenu(dto: CreateMenuDto, createdBy: string): Promise<{
        id: number;
        module: string | null;
        updatedAt: Date | null;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        path: string | null;
        orderNum: number | null;
        menuName: string;
        node: string | null;
        parentId: number | null;
        icon: string | null;
    }>;
    updateMenu(id: number, dto: UpdateMenuDto, updatedBy: string): Promise<{
        id: number;
        module: string | null;
        updatedAt: Date | null;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        path: string | null;
        orderNum: number | null;
        menuName: string;
        node: string | null;
        parentId: number | null;
        icon: string | null;
    }>;
    deleteMenu(id: number, deletedBy: string): Promise<{
        id: number;
        module: string | null;
        updatedAt: Date | null;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        path: string | null;
        orderNum: number | null;
        menuName: string;
        node: string | null;
        parentId: number | null;
        icon: string | null;
    }>;
    assignMenusToRole(roleId: number, dto: AssignMenusToRoleDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getRoleMenus(roleId: number): Promise<{
        permissions: {
            canCreate: boolean;
            canRead: boolean;
            canUpdate: boolean;
            canDelete: boolean;
        };
        id: number;
        module: string | null;
        updatedAt: Date | null;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        path: string | null;
        orderNum: number | null;
        menuName: string;
        node: string | null;
        parentId: number | null;
        icon: string | null;
    }[]>;
    copyPermissions(dto: CopyPermissionsDto): Promise<{
        success: boolean;
        message: string;
        copiedCount: number;
    }>;
    private buildMenuTree;
}
