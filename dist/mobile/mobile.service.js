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
exports.MobileService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let MobileService = class MobileService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfileAndBalance(nasabahId) {
        const nasabah = await this.prisma.nasabah.findUnique({
            where: { id: nasabahId },
            include: {
                anggota: { where: { status: 'A', isActive: true } },
                tabungan: { where: { status: 'A' } },
                deposito: { where: { status: 'A' } },
                brahmacari: { where: { status: 'A' } },
                balimesari: { where: { status: 'A' } },
                wanaprasta: { where: { status: 'A' } },
            },
        });
        if (!nasabah)
            throw new common_1.NotFoundException('Nasabah not found');
        let totalBalance = 0;
        nasabah.anggota.forEach(a => totalBalance += Number(a.balance));
        nasabah.tabungan.forEach(a => totalBalance += Number(a.saldo));
        nasabah.deposito.forEach(a => totalBalance += Number(a.nominal));
        nasabah.brahmacari.forEach(a => totalBalance += Number(a.saldo));
        nasabah.balimesari.forEach(a => totalBalance += Number(a.saldo));
        nasabah.wanaprasta.forEach(a => totalBalance += Number(a.saldo));
        return {
            nasabah: {
                id: nasabah.id,
                nama: nasabah.nama,
                noKtp: nasabah.noKtp,
                alamat: nasabah.alamat,
                email: nasabah.email,
                telepon: nasabah.telepon,
            },
            totalBalance,
            accounts: {
                anggota: nasabah.anggota,
                tabungan: nasabah.tabungan,
                deposito: nasabah.deposito,
                brahmacari: nasabah.brahmacari,
                balimesari: nasabah.balimesari,
                wanaprasta: nasabah.wanaprasta,
            }
        };
    }
    async getWithdrawals(nasabahId) {
        return this.prisma.withdrawalRequest.findMany({
            where: { nasabahId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createWithdrawal(nasabahId, data) {
        const { amount, deliveryAddress, scheduledDate, timeSlot, notes } = data;
        let dateObj;
        try {
            dateObj = new Date(scheduledDate);
            if (isNaN(dateObj.getTime())) {
                throw new Error('Invalid date');
            }
        }
        catch (e) {
            throw new common_1.BadRequestException('Format tanggal tidak valid');
        }
        const day = dateObj.getDay();
        if (day === 0 || day === 6) {
            throw new common_1.BadRequestException('Penarikan hanya bisa dijadwalkan hari Senin - Jumat');
        }
        const referenceNumber = 'WD' + Date.now() + Math.floor(Math.random() * 1000);
        return this.prisma.withdrawalRequest.create({
            data: {
                nasabahId,
                amount,
                deliveryAddress,
                scheduledDate: dateObj,
                timeSlot,
                notes,
                referenceNumber,
                status: 'SCHEDULED',
                totalDeducted: amount,
            }
        });
    }
    async getWithdrawal(nasabahId, id) {
        const req = await this.prisma.withdrawalRequest.findFirst({
            where: { nasabahId, id }
        });
        if (!req)
            throw new common_1.NotFoundException('Withdrawal request not found');
        return req;
    }
    async getTransactions(nasabahId) {
        const transTab = await this.prisma.transTab.findMany({
            where: { tabungan: { nasabahId } },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        const tabTransactions = transTab.map(t => ({
            id: `tab_${t.id}`,
            date: t.createdAt,
            type: t.tipeTrans,
            amount: t.nominal,
            description: t.keterangan || 'Transaksi Tabungan',
            source: 'Tabungan',
        }));
        const transAnggota = await this.prisma.anggotaTransaction.findMany({
            where: { account: { customerId: nasabahId } },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        const anggotaTransactions = transAnggota.map(t => ({
            id: `ang_${t.id}`,
            date: t.transDate,
            type: t.transType,
            amount: t.amount,
            description: t.description || 'Transaksi Anggota',
            source: 'Simpanan Anggota',
        }));
        const all = [...tabTransactions, ...anggotaTransactions].sort((a, b) => b.date.getTime() - a.date.getTime());
        return all;
    }
};
exports.MobileService = MobileService;
exports.MobileService = MobileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MobileService);
//# sourceMappingURL=mobile.service.js.map