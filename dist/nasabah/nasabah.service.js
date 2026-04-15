"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NasabahService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
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
            where: { isActive: true },
        });
    }
    async findOne(id) {
        const nasabah = await this.prisma.nasabah.findUnique({
            where: { id },
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
            data: updateNasabahDto,
        });
    }
    async searchNasabah(query, type) {
        if (!query)
            return [];
        const whereInput = {
            isActive: true,
            OR: [
                { nama: { contains: query } },
                { noKtp: { contains: query } },
                { anggota: { some: { accountNumber: { contains: query } } } },
                { tabungan: { some: { noTab: { contains: query } } } },
                { brahmacari: { some: { noBrahmacari: { contains: query } } } },
                { balimesari: { some: { noBalimesari: { contains: query } } } },
                { wanaprasta: { some: { noWanaprasta: { contains: query } } } },
                { kredit: { some: { nomorKredit: { contains: query } } } },
            ],
        };
        const results = await this.prisma.nasabah.findMany({
            where: whereInput,
            take: 10,
            include: {
                anggota: { where: { status: 'A' } },
                tabungan: { where: { status: 'A' } },
                brahmacari: { where: { status: 'A' } },
                balimesari: { where: { status: 'A' } },
                wanaprasta: { where: { status: 'A' } },
                kredit: { where: { status: 'A' } },
            },
        });
        return results;
    }
    async getPortfolio(id) {
        const nasabah = await this.prisma.nasabah.findUnique({
            where: { id },
            include: {
                anggota: true,
                tabungan: { where: { status: 'A' } },
                deposito: { where: { status: 'A' } },
                brahmacari: { where: { status: 'A' } },
                balimesari: { where: { status: 'A' } },
                wanaprasta: { where: { status: 'A' } },
                kredit: { where: { status: 'A' } },
            },
        });
        if (!nasabah)
            throw new common_1.NotFoundException(`Nasabah #${id} not found`);
        return nasabah;
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
            },
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
            data: { isActive: false },
        });
    }
    async getMobileAccess(nasabahId) {
        const mobileUser = await this.prisma.mobileUser.findUnique({
            where: { nasabahId },
        });
        if (!mobileUser)
            return null;
        return {
            isActive: mobileUser.isActive,
            username: mobileUser.username,
            lastLoginAt: mobileUser.lastLoginAt,
        };
    }
    async activateMobileAccess(nasabahId, reqBody) {
        const { username, password } = reqBody;
        const existing = await this.prisma.mobileUser.findUnique({
            where: { username },
        });
        if (existing && existing.nasabahId !== nasabahId) {
            throw new common_1.BadRequestException('Username has already been taken.');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        return this.prisma.mobileUser.upsert({
            where: { nasabahId },
            create: {
                nasabahId,
                username,
                password: hashedPassword,
                isActive: true,
            },
            update: {
                username,
                password: hashedPassword,
                isActive: true,
            },
        });
    }
    async deactivateMobileAccess(nasabahId) {
        const existing = await this.prisma.mobileUser.findUnique({
            where: { nasabahId },
        });
        if (!existing) {
            throw new common_1.BadRequestException('Mobile access not configured for this Nasabah');
        }
        return this.prisma.mobileUser.update({
            where: { nasabahId },
            data: { isActive: false },
        });
    }
};
exports.NasabahService = NasabahService;
exports.NasabahService = NasabahService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NasabahService);
//# sourceMappingURL=nasabah.service.js.map