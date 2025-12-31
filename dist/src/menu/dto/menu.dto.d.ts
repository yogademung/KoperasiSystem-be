export declare class CreateMenuDto {
    menuName: string;
    module?: string;
    node?: string;
    parentId?: number;
    icon?: string;
    path?: string;
    orderNum?: number;
    isActive?: boolean;
}
export declare class UpdateMenuDto {
    menuName?: string;
    module?: string;
    node?: string;
    parentId?: number | null;
    icon?: string;
    path?: string;
    orderNum?: number;
    isActive?: boolean;
}
export declare class MenuPermissionDto {
    menuId: number;
    canCreate: boolean;
    canRead: boolean;
    canUpdate: boolean;
    canDelete: boolean;
}
export declare class AssignMenusToRoleDto {
    menuPermissions: MenuPermissionDto[];
}
export declare class CopyPermissionsDto {
    sourceRoleId: number;
    targetRoleId: number;
    overwriteExisting?: boolean;
}
