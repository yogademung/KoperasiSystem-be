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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessUnitService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let BusinessUnitService = class BusinessUnitService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.businessUnit.findMany({
            orderBy: { id: 'asc' }
        });
    }
    async findActive() {
        return this.prisma.businessUnit.findMany({
            where: { isActive: true },
            orderBy: { id: 'asc' }
        });
    }
    async findOne(id) {
        return this.prisma.businessUnit.findUnique({
            where: { id }
        });
    }
    async create(dto) {
        return this.prisma.businessUnit.create({
            data: dto
        });
    }
    async update(id, dto) {
        return this.prisma.businessUnit.update({
            where: { id },
            data: dto
        });
    }
    async delete(id) {
        const linkedAccounts = await this.prisma.journalAccount.count({ where: { businessUnitId: id } });
        const linkedCostCenters = await this.prisma.costCenter.count({ where: { businessUnitId: id } });
        if (linkedAccounts > 0 || linkedCostCenters > 0) {
            throw new Error('Business Unit cannot be deleted because it is still linked to accounts or cost centers.');
        }
        return this.prisma.businessUnit.delete({
            where: { id }
        });
    }
};
exports.BusinessUnitService = BusinessUnitService;
exports.BusinessUnitService = BusinessUnitService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BusinessUnitService);
//# sourceMappingURL=business-unit.service.js.map