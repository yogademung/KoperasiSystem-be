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
exports.PosShiftService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let PosShiftService = class PosShiftService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async openShift(userId, startingCash = 0) {
        const existing = await this.prisma.posShift.findFirst({
            where: { userId, status: 'OPEN' }
        });
        if (existing)
            throw new common_1.BadRequestException('User already has an open shift (Shift ID: ' + existing.id + ')');
        return this.prisma.posShift.create({
            data: {
                userId,
                startingCash,
                shiftDate: new Date(),
                status: 'OPEN'
            }
        });
    }
    async closeShift(shiftId, endingCash) {
        return this.prisma.$transaction(async (tx) => {
            const shift = await tx.posShift.findUnique({
                where: { id: shiftId },
                include: { sales: { include: { items: true } } }
            });
            if (!shift)
                throw new common_1.NotFoundException('Shift not found');
            if (shift.status === 'CLOSED')
                throw new common_1.BadRequestException('Shift is already closed');
            let totalRevenue = 0;
            let totalCogs = 0;
            shift.sales.forEach(sale => {
                if (sale.status === 'COMPLETED') {
                    totalRevenue += Number(sale.totalAmount);
                    sale.items.forEach(item => {
                        totalCogs += Number(item.cogsPrice) * Number(item.quantity);
                    });
                }
            });
            let journalId = null;
            if (totalRevenue > 0) {
                const jrnDate = new Date();
                const jrnNo = `JPOS-${jrnDate.getFullYear()}${(jrnDate.getMonth() + 1).toString().padStart(2, '0')}${jrnDate.getDate().toString().padStart(2, '0')}-${shiftId}`;
                const journal = await tx.postedJournal.create({
                    data: {
                        journalNumber: jrnNo,
                        journalDate: jrnDate,
                        description: `Rekapitulasi Penjualan POS Kasir Tutup Shift #${shiftId}`,
                        postingType: 'AUTO',
                        transType: 'POS_CLOSING',
                        refId: shiftId,
                        userId: shift.userId,
                        status: 'POSTED',
                        createdBy: 'SYSTEM',
                        details: {
                            create: [
                                { accountCode: '111-10', debit: totalRevenue, credit: 0, description: 'Penerimaan Kasir POS' },
                                { accountCode: '411-10', debit: 0, credit: totalRevenue, description: 'Pendapatan Penjualan POS' },
                                ...(totalCogs > 0 ? [
                                    { accountCode: '511-10', debit: totalCogs, credit: 0, description: 'HPP Penjualan POS' },
                                    { accountCode: '114-10', debit: 0, credit: totalCogs, description: 'Pengurangan Persediaan POS' }
                                ] : [])
                            ]
                        }
                    }
                });
                journalId = journal.id;
            }
            const closedShift = await tx.posShift.update({
                where: { id: shiftId },
                data: {
                    status: 'CLOSED',
                    endTime: new Date(),
                    totalSales: totalRevenue,
                    endingCash: endingCash,
                    journalId: journalId
                }
            });
            return closedShift;
        });
    }
    async getActiveShift(userId) {
        return this.prisma.posShift.findFirst({
            where: { userId, status: 'OPEN' },
            include: { sales: true }
        });
    }
};
exports.PosShiftService = PosShiftService;
exports.PosShiftService = PosShiftService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PosShiftService);
//# sourceMappingURL=pos-shift.service.js.map