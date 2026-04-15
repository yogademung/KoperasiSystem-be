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
exports.BusinessUnitController = void 0;
const common_1 = require("@nestjs/common");
const business_unit_service_1 = require("./business-unit.service");
const business_unit_dto_1 = require("./dto/business-unit.dto");
let BusinessUnitController = class BusinessUnitController {
    businessUnitService;
    constructor(businessUnitService) {
        this.businessUnitService = businessUnitService;
    }
    async findAll() {
        return this.businessUnitService.findAll();
    }
    async findActive() {
        return this.businessUnitService.findActive();
    }
    async findOne(id) {
        return this.businessUnitService.findOne(id);
    }
    async create(dto) {
        return this.businessUnitService.create(dto);
    }
    async update(id, dto) {
        return this.businessUnitService.update(id, dto);
    }
    async delete(id) {
        return this.businessUnitService.delete(id);
    }
};
exports.BusinessUnitController = BusinessUnitController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BusinessUnitController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BusinessUnitController.prototype, "findActive", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BusinessUnitController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [business_unit_dto_1.CreateBusinessUnitDto]),
    __metadata("design:returntype", Promise)
], BusinessUnitController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, business_unit_dto_1.UpdateBusinessUnitDto]),
    __metadata("design:returntype", Promise)
], BusinessUnitController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BusinessUnitController.prototype, "delete", null);
exports.BusinessUnitController = BusinessUnitController = __decorate([
    (0, common_1.Controller)('business-units'),
    __metadata("design:paramtypes", [business_unit_service_1.BusinessUnitService])
], BusinessUnitController);
//# sourceMappingURL=business-unit.controller.js.map