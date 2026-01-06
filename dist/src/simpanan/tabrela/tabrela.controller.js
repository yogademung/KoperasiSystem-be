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
exports.TabrelaController = void 0;
const common_1 = require("@nestjs/common");
const tabrela_service_1 = require("./tabrela.service");
const create_tabrela_dto_1 = require("./dto/create-tabrela.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let TabrelaController = class TabrelaController {
    tabrelaService;
    constructor(tabrelaService) {
        this.tabrelaService = tabrelaService;
    }
    create(createDto) {
        return this.tabrelaService.create(createDto);
    }
    findAll() {
        return this.tabrelaService.findAll();
    }
    findOne(noTab) {
        return this.tabrelaService.findOne(noTab);
    }
    setoran(noTab, body) {
        return this.tabrelaService.setoran(noTab, body);
    }
    penarikan(noTab, body) {
        return this.tabrelaService.penarikan(noTab, body);
    }
    close(noTab, body) {
        return this.tabrelaService.closeAccount(noTab, body);
    }
};
exports.TabrelaController = TabrelaController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tabrela_dto_1.CreateTabrelaDto]),
    __metadata("design:returntype", void 0)
], TabrelaController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TabrelaController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':noTab'),
    __param(0, (0, common_1.Param)('noTab')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TabrelaController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':noTab/setoran'),
    __param(0, (0, common_1.Param)('noTab')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TabrelaController.prototype, "setoran", null);
__decorate([
    (0, common_1.Post)(':noTab/penarikan'),
    __param(0, (0, common_1.Param)('noTab')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TabrelaController.prototype, "penarikan", null);
__decorate([
    (0, common_1.Post)(':noTab/tutup'),
    __param(0, (0, common_1.Param)('noTab')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TabrelaController.prototype, "close", null);
exports.TabrelaController = TabrelaController = __decorate([
    (0, common_1.Controller)('api/simpanan/tabrela'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [tabrela_service_1.TabrelaService])
], TabrelaController);
//# sourceMappingURL=tabrela.controller.js.map