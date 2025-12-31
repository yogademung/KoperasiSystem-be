// Enhanced Menu DTOs with CRUD Permissions

import { IsString, IsOptional, IsInt, IsBoolean, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMenuDto {
    @IsString()
    menuName: string;

    @IsOptional()
    @IsString()
    module?: string;

    @IsOptional()
    @IsString()
    node?: string;

    @IsOptional()
    @IsInt()
    parentId?: number;

    @IsOptional()
    @IsString()
    icon?: string;

    @IsOptional()
    @IsString()
    path?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    orderNum?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateMenuDto {
    @IsOptional()
    @IsString()
    menuName?: string;

    @IsOptional()
    @IsString()
    module?: string;

    @IsOptional()
    @IsString()
    node?: string;

    @IsOptional()
    @IsInt()
    parentId?: number | null;

    @IsOptional()
    @IsString()
    icon?: string;

    @IsOptional()
    @IsString()
    path?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    orderNum?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

// Enhanced: Menu Permission with CRUD flags
export class MenuPermissionDto {
    @IsInt()
    menuId: number;

    @IsBoolean()
    canCreate: boolean;

    @IsBoolean()
    canRead: boolean;

    @IsBoolean()
    canUpdate: boolean;

    @IsBoolean()
    canDelete: boolean;
}

// Enhanced: Assign menus with CRUD permissions
export class AssignMenusToRoleDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MenuPermissionDto)
    menuPermissions: MenuPermissionDto[];
}

// New: Copy permissions from another role
export class CopyPermissionsDto {
    @IsInt()
    sourceRoleId: number;

    @IsInt()
    targetRoleId: number;

    @IsOptional()
    @IsBoolean()
    overwriteExisting?: boolean; // Default: false
}
