import { MenuService } from './menu.service';
import { CreateMenuDto, UpdateMenuDto, AssignMenusToRoleDto, CopyPermissionsDto } from './dto/menu.dto';
export declare class MenuController {
    private menuService;
    constructor(menuService: MenuService);
    getAllMenus(): Promise<any[]>;
    getMenusForRole(roleId: number): Promise<any[]>;
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
        orderNum: number | null;
        icon: string | null;
        menuName: string;
        node: string | null;
        parentId: number | null;
        path: string | null;
    }>;
    createMenu(dto: CreateMenuDto, req: any): Promise<{
        id: number;
        module: string | null;
        updatedAt: Date | null;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        orderNum: number | null;
        icon: string | null;
        menuName: string;
        node: string | null;
        parentId: number | null;
        path: string | null;
    }>;
    updateMenu(id: number, dto: UpdateMenuDto, req: any): Promise<{
        id: number;
        module: string | null;
        updatedAt: Date | null;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        orderNum: number | null;
        icon: string | null;
        menuName: string;
        node: string | null;
        parentId: number | null;
        path: string | null;
    }>;
    deleteMenu(id: number, req: any): Promise<{
        id: number;
        module: string | null;
        updatedAt: Date | null;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        orderNum: number | null;
        icon: string | null;
        menuName: string;
        node: string | null;
        parentId: number | null;
        path: string | null;
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
        orderNum: number | null;
        icon: string | null;
        menuName: string;
        node: string | null;
        parentId: number | null;
        path: string | null;
    }[]>;
    assignMenusToRole(roleId: number, dto: AssignMenusToRoleDto): Promise<{
        success: boolean;
        message: string;
    }>;
    copyPermissions(dto: CopyPermissionsDto): Promise<{
        success: boolean;
        message: string;
        copiedCount: number;
    }>;
}
