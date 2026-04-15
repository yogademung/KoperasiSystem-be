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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuController = void 0;
const common_1 = require("@nestjs/common");
const menu_service_1 = require("./menu.service");
const menu_dto_1 = require("./dto/menu.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let MenuController = class MenuController {
    menuService;
    constructor(menuService) {
        this.menuService = menuService;
    }
    async getAllMenus() {
        return this.menuService.getAllMenus();
    }
    async getMenusForRole(roleId) {
        return this.menuService.getMenusForRole(roleId);
    }
    async getMenuById(id) {
        return this.menuService.getMenuById(id);
    }
    async createMenu(dto, req) {
        const createdBy = req.user?.username || 'system';
        return this.menuService.createMenu(dto, createdBy);
    }
    async updateMenu(id, dto, req) {
        const updatedBy = req.user?.username || 'system';
        return this.menuService.updateMenu(id, dto, updatedBy);
    }
    async deleteMenu(id, req) {
        const deletedBy = req.user?.username || 'system';
        return this.menuService.deleteMenu(id, deletedBy);
    }
    async getRoleMenus(roleId) {
        return this.menuService.getRoleMenus(roleId);
    }
    async assignMenusToRole(roleId, dto) {
        return this.menuService.assignMenusToRole(roleId, dto);
    }
    async copyPermissions(dto) {
        return this.menuService.copyPermissions(dto);
    }
};
exports.MenuController = MenuController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "getAllMenus", null);
__decorate([
    (0, common_1.Get)('role/:roleId'),
    __param(0, (0, common_1.Param)('roleId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "getMenusForRole", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "getMenuById", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [menu_dto_1.CreateMenuDto, Object]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "createMenu", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, menu_dto_1.UpdateMenuDto, Object]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "updateMenu", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "deleteMenu", null);
__decorate([
    (0, common_1.Get)('role/:roleId/menus'),
    __param(0, (0, common_1.Param)('roleId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "getRoleMenus", null);
__decorate([
    (0, common_1.Post)('role/:roleId/menus'),
    __param(0, (0, common_1.Param)('roleId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, menu_dto_1.AssignMenusToRoleDto]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "assignMenusToRole", null);
__decorate([
    (0, common_1.Post)('copy-permissions'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [menu_dto_1.CopyPermissionsDto]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "copyPermissions", null);
exports.MenuController = MenuController = __decorate([
    (0, common_1.Controller)('api/menu'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [menu_service_1.MenuService])
], MenuController);
//# sourceMappingURL=menu.controller.js.map