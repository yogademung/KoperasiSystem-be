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
exports.VendorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let VendorService = class VendorService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const vendor = await this.prisma.vendor.create({
            data: {
                ...data,
                code: `TMP-${Date.now()}`
            }
        });
        return this.prisma.vendor.update({
            where: { id: vendor.id },
            data: { code: `VND-${vendor.id.toString().padStart(4, '0')}` }
        });
    }
    async findAll() {
        return this.prisma.vendor.findMany();
    }
    async findOne(id) {
        const vendor = await this.prisma.vendor.findUnique({ where: { id } });
        if (!vendor)
            throw new common_1.NotFoundException('Vendor not found');
        return vendor;
    }
    async update(id, data) {
        return this.prisma.vendor.update({ where: { id }, data });
    }
    async remove(id) {
        const historyCount = await this.prisma.apInvoice.count({ where: { vendorId: id } });
        if (historyCount > 0) {
            throw new common_1.BadRequestException('Vendor tidak dapat dihapus karena telah memiliki riwayat transaksi (Tagihan Hutang).');
        }
        return this.prisma.vendor.delete({ where: { id } });
    }
    async getApAging() {
        const invoices = await this.prisma.apInvoice.findMany({
            where: { status: { not: 'PAID' } },
            include: { vendor: true },
            orderBy: { dueDate: 'asc' }
        });
        const now = new Date();
        const vendorMap = new Map();
        invoices.forEach(inv => {
            const vId = inv.vendorId;
            if (!vendorMap.has(vId)) {
                vendorMap.set(vId, {
                    vendorId: vId,
                    vendorCode: inv.vendor.code,
                    vendorName: inv.vendor.name,
                    totalUnpaid: 0,
                    current: 0,
                    days1_30: 0,
                    days31_60: 0,
                    days61_90: 0,
                    older: 0
                });
            }
            const vm = vendorMap.get(vId);
            const remaining = Number(inv.totalAmount) - Number(inv.paidAmount);
            vm.totalUnpaid += remaining;
            const diffTime = Math.ceil((now.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24));
            if (diffTime <= 0)
                vm.current += remaining;
            else if (diffTime <= 30)
                vm.days1_30 += remaining;
            else if (diffTime <= 60)
                vm.days31_60 += remaining;
            else if (diffTime <= 90)
                vm.days61_90 += remaining;
            else
                vm.older += remaining;
        });
        return Array.from(vendorMap.values());
    }
};
exports.VendorService = VendorService;
exports.VendorService = VendorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VendorService);
//# sourceMappingURL=vendor.service.js.map