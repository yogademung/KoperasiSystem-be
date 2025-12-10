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
exports.NasabahService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let NasabahService = class NasabahService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createNasabahDto) {
        return this.prisma.nasabah.create({
            data: createNasabahDto,
        });
    }
    async findAll() {
        return this.prisma.nasabah.findMany({
            orderBy: { createdAt: 'desc' },
            where: { isActive: true }
        });
    }
    async findOne(id) {
        const nasabah = await this.prisma.nasabah.findUnique({
            where: { id }
        });
        if (!nasabah) {
            throw new common_1.NotFoundException(`Nasabah #${id} not found`);
        }
        return nasabah;
    }
    async update(id, updateNasabahDto) {
        await this.findOne(id);
        return this.prisma.nasabah.update({
            where: { id },
            data: updateNasabahDto
        });
    }
    async remove(id) {
        const nasabah = await this.prisma.nasabah.findUnique({
            where: { id },
            include: {
                anggota: true,
                tabungan: true,
                deposito: true,
                brahmacari: true,
                balimesari: true,
                wanaprasta: true,
                kredit: true,
            }
        });
        if (!nasabah) {
            throw new common_1.NotFoundException(`Nasabah #${id} not found`);
        }
        const activeProducts = [];
        if (nasabah.anggota?.length > 0)
            activeProducts.push('Simpanan Anggota');
        if (nasabah.tabungan?.length > 0)
            activeProducts.push('Tabungan Sukarela');
        if (nasabah.deposito?.length > 0)
            activeProducts.push('Deposito (Simpanan Jangka)');
        if (nasabah.brahmacari?.length > 0)
            activeProducts.push('Brahmacari');
        if (nasabah.balimesari?.length > 0)
            activeProducts.push('Bali Mesari');
        if (nasabah.wanaprasta?.length > 0)
            activeProducts.push('Wanaprasta');
        if (nasabah.kredit?.length > 0)
            activeProducts.push('Kredit/Pinjaman');
        if (activeProducts.length > 0) {
            throw new common_1.BadRequestException(`Gagal menghapus: Nasabah masih memiliki ${activeProducts.join(', ')}`);
        }
        return this.prisma.nasabah.update({
            where: { id },
            data: { isActive: false }
        });
    }
};
exports.NasabahService = NasabahService;
exports.NasabahService = NasabahService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NasabahService);
//# sourceMappingURL=nasabah.service.js.map