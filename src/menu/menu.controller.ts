// Menu Controller - Enhanced with CRUD Permissions and Copy Feature

import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    UseGuards,
    Req
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto, UpdateMenuDto, AssignMenusToRoleDto, CopyPermissionsDto } from './dto/menu.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('api/menu')
@UseGuards(JwtAuthGuard)
export class MenuController {
    constructor(private menuService: MenuService) { }

    /**
     * GET /api/menu - Get all menus (hierarchical)
     */
    @Get()
    async getAllMenus() {
        return this.menuService.getAllMenus();
    }

    /**
     * GET /api/menu/role/:roleId - Get menus for specific role with CRUD permissions
     */
    @Get('role/:roleId')
    async getMenusForRole(@Param('roleId', ParseIntPipe) roleId: number) {
        return this.menuService.getMenusForRole(roleId);
    }

    /**
     * GET /api/menu/:id - Get menu by ID
     */
    @Get(':id')
    async getMenuById(@Param('id', ParseIntPipe) id: number) {
        return this.menuService.getMenuById(id);
    }

    /**
     * POST /api/menu - Create new menu
     */
    @Post()
    async createMenu(@Body() dto: CreateMenuDto, @Req() req: any) {
        const createdBy = req.user?.username || 'system';
        return this.menuService.createMenu(dto, createdBy);
    }

    /**
     * PUT /api/menu/:id - Update menu
     */
    @Put(':id')
    async updateMenu(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateMenuDto,
        @Req() req: any
    ) {
        const updatedBy = req.user?.username || 'system';
        return this.menuService.updateMenu(id, dto, updatedBy);
    }

    /**
     * DELETE /api/menu/:id - Delete menu (soft delete)
     */
    @Delete(':id')
    async deleteMenu(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
        const deletedBy = req.user?.username || 'system';
        return this.menuService.deleteMenu(id, deletedBy);
    }

    /**
     * GET /api/menu/role/:roleId/menus - Get menu permissions for role
     */
    @Get('role/:roleId/menus')
    async getRoleMenus(@Param('roleId', ParseIntPipe) roleId: number) {
        return this.menuService.getRoleMenus(roleId);
    }

    /**
     * POST /api/menu/role/:roleId/menus - Assign menus with CRUD permissions to role
     */
    @Post('role/:roleId/menus')
    async assignMenusToRole(
        @Param('roleId', ParseIntPipe) roleId: number,
        @Body() dto: AssignMenusToRoleDto
    ) {
        return this.menuService.assignMenusToRole(roleId, dto);
    }

    /**
     * POST /api/menu/copy-permissions - Copy permissions from one role to another
     */
    @Post('copy-permissions')
    async copyPermissions(@Body() dto: CopyPermissionsDto) {
        return this.menuService.copyPermissions(dto);
    }
}
