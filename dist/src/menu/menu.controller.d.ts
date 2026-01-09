import { MenuService } from './menu.service';
import { CreateMenuDto, UpdateMenuDto, AssignMenusToRoleDto, CopyPermissionsDto } from './dto/menu.dto';
export declare class MenuController {
    private menuService;
    constructor(menuService: MenuService);
    getAllMenus(): Promise<any[]>;
    getMenusForRole(roleId: number): Promise<any[]>;
    getMenuById(id: number): Promise<any>;
    createMenu(dto: CreateMenuDto, req: any): Promise<any>;
    updateMenu(id: number, dto: UpdateMenuDto, req: any): Promise<any>;
    deleteMenu(id: number, req: any): Promise<any>;
    getRoleMenus(roleId: number): Promise<any>;
    assignMenusToRole(roleId: number, dto: AssignMenusToRoleDto): Promise<{
        success: boolean;
        message: string;
    }>;
    copyPermissions(dto: CopyPermissionsDto): Promise<{
        success: boolean;
        message: string;
        copiedCount: any;
    }>;
}
