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
exports.WarehouseService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let WarehouseService = class WarehouseService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.warehouse.create({ data });
    }
    async findAll() {
        return this.prisma.warehouse.findMany({
            orderBy: { name: 'asc' }
        });
    }
    async findOne(id) {
        const warehouse = await this.prisma.warehouse.findUnique({ where: { id } });
        if (!warehouse)
            throw new common_1.NotFoundException('Warehouse not found');
        return warehouse;
    }
    async update(id, data) {
        return this.prisma.warehouse.update({ where: { id }, data });
    }
    async remove(id) {
        const history1 = await this.prisma.goodsReceipt.count({ where: { warehouseId: id } });
        const history2 = await this.prisma.warehouseStock.count({ where: { warehouseId: id, quantity: { gt: 0 } } });
        if (history1 > 0 || history2 > 0) {
            throw new common_1.BadRequestException('Master Gudang tidak dapat dihapus karena tersangkut histori penerimaan atau masih memiliki sisa stok berjalan.');
        }
        return this.prisma.warehouse.delete({ where: { id } });
    }
};
exports.WarehouseService = WarehouseService;
exports.WarehouseService = WarehouseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WarehouseService);
//# sourceMappingURL=warehouse.service.js.map