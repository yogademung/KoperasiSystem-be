import { PrismaService } from '../database/prisma.service';
import { CreateMenuDto, UpdateMenuDto, AssignMenusToRoleDto, CopyPermissionsDto } from './dto/menu.dto';
export declare class MenuService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllMenus(): Promise<any[]>;
    getMenuById(id: number): Promise<any>;
    getMenusForRole(roleId: number): Promise<any[]>;
    createMenu(dto: CreateMenuDto, createdBy: string): Promise<any>;
    updateMenu(id: number, dto: UpdateMenuDto, updatedBy: string): Promise<any>;
    deleteMenu(id: number, deletedBy: string): Promise<any>;
    assignMenusToRole(roleId: number, dto: AssignMenusToRoleDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getRoleMenus(roleId: number): Promise<any>;
    copyPermissions(dto: CopyPermissionsDto): Promise<{
        success: boolean;
        message: string;
        copiedCount: any;
    }>;
    private buildMenuTree;
}
