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
const accounting_service_1 = require("../../accounting/accounting.service");
let PosShiftService = class PosShiftService {
    prisma;
    accountingService;
    constructor(prisma, accountingService) {
        this.prisma = prisma;
        this.accountingService = accountingService;
    }
    async openShift(userId, startingCash = 0) {
        const existing = await this.prisma.posShift.findFirst({
            where: { userId, status: 'OPEN' }
        });
        if (existing)
            throw new common_1.BadRequestException('User already has an open shift (Shift ID: ' + existing.id + ')');
        const shift = await this.prisma.posShift.create({
            data: {
                userId,
                startingCash,
                shiftDate: new Date(),
                status: 'OPEN'
            }
        });
        if (startingCash > 0) {
            try {
                const user = await this.prisma.user.findUnique({ where: { id: userId } });
                const userName = user ? user.fullName : 'Kasir';
                await this.accountingService.createManualJournal({
                    date: new Date(),
                    userId: userId,
                    description: `Modal Awal Shift Kasir POS - ${userName} (Shift #${shift.id})`,
                    postingType: 'AUTO',
                    details: [
                        {
                            accountCode: '1.01.02',
                            debit: startingCash,
                            credit: 0,
                            description: 'Kas Transit / Kasir POS (Modal)',
                        },
                        {
                            accountCode: '1.01.01',
                            debit: 0,
                            credit: startingCash,
                            description: 'Kas Kantor (Keluar)',
                        },
                    ],
                });
            }
            catch (error) {
                console.error('Failed to post start shift journal for POS:', error);
            }
        }
        return shift;
    }
    async closeShift(shiftId, endingCash) {
        const resultShift = await this.prisma.$transaction(async (tx) => {
            const shift = await tx.posShift.findUnique({
                where: { id: shiftId },
                include: {
                    sales: {
                        where: { status: 'COMPLETED' },
                        include: {
                            items: {
                                include: {
                                    posProduct: {
                                        include: { recipes: true }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            if (!shift)
                throw new common_1.NotFoundException('Shift not found');
            if (shift.status === 'CLOSED')
                throw new common_1.BadRequestException('Shift is already closed');
            const posSaleMap = await tx.productCoaMapping.findUnique({ where: { transType: 'POS_SALE' } });
            const posHppMap = await tx.productCoaMapping.findUnique({ where: { transType: 'POS_HPP' } });
            const posDiscountMap = await tx.productCoaMapping.findUnique({ where: { transType: 'POS_DISCOUNT' } });
            let totalNetRevenue = 0;
            let totalDiscount = 0;
            let totalRevWithInv = 0;
            let totalCogs = 0;
            let totalRevNoInv = 0;
            let totalCogsNoInv = 0;
            shift.sales.forEach(sale => {
                totalNetRevenue += Number(sale.totalAmount);
                totalDiscount += Number(sale.discountAmount || 0);
                sale.items.forEach(item => {
                    const qty = Number(item.quantity);
                    const sellPrice = Number(item.unitPrice);
                    const cogsPrice = Number(item.cogsPrice);
                    const hasInventory = (item.posProduct.recipes?.length || 0) > 0;
                    if (hasInventory) {
                        totalRevWithInv += qty * sellPrice;
                        totalCogs += qty * cogsPrice;
                    }
                    else {
                        totalRevNoInv += qty * sellPrice;
                        totalCogsNoInv += qty * cogsPrice;
                    }
                });
            });
            const totalGrossRevenue = totalRevWithInv + totalRevNoInv;
            let journalId = null;
            if (totalGrossRevenue > 0 || endingCash > 0) {
                const jrnDate = new Date();
                const dateStr = `${jrnDate.getFullYear()}${(jrnDate.getMonth() + 1).toString().padStart(2, '0')}${jrnDate.getDate().toString().padStart(2, '0')}`;
                const revDetails = [];
                if (totalNetRevenue > 0) {
                    revDetails.push({
                        accountCode: posSaleMap?.debitAccount || '1.01.02',
                        debit: totalNetRevenue,
                        credit: 0,
                        description: 'Penerimaan Kas Kasir POS'
                    });
                    if (totalDiscount > 0) {
                        revDetails.push({
                            accountCode: posDiscountMap?.debitAccount || '5.60.01',
                            debit: totalDiscount,
                            credit: 0,
                            description: 'Diskon Penjualan POS'
                        });
                    }
                    revDetails.push({
                        accountCode: posSaleMap?.creditAccount || '4.30.01',
                        debit: 0,
                        credit: totalGrossRevenue,
                        description: 'Pendapatan Penjualan POS'
                    });
                }
                if (endingCash > 0) {
                    revDetails.push({
                        accountCode: '1.01.01',
                        debit: endingCash,
                        credit: 0,
                        description: 'Setor Kas ke Kas Kantor (Akhir Shift)'
                    }, {
                        accountCode: posSaleMap?.debitAccount || '1.01.02',
                        debit: 0,
                        credit: endingCash,
                        description: 'Kas Transit Kasir POS (Keluar)'
                    });
                }
                const journalRev = await tx.postedJournal.create({
                    data: {
                        journalNumber: `JPOS-${dateStr}-${shiftId}`,
                        journalDate: jrnDate,
                        description: `Revenue & Setor Kas POS - Tutup Shift #${shiftId}`,
                        postingType: 'AUTO',
                        transType: 'POS_CLOSING',
                        refId: shiftId,
                        userId: shift.userId,
                        status: 'POSTED',
                        createdBy: 'SYSTEM',
                        details: { create: revDetails }
                    }
                });
                journalId = journalRev.id;
                const hppDetails = [];
                if (totalCogs > 0) {
                    hppDetails.push({
                        accountCode: posHppMap?.debitAccount || '5.50.01',
                        debit: totalCogs,
                        credit: 0,
                        description: 'HPP Penjualan POS (Item Berbasis Inventory)'
                    }, {
                        accountCode: posHppMap?.creditAccount || '1.10.01',
                        debit: 0,
                        credit: totalCogs,
                        description: 'Pengurangan Persediaan POS'
                    });
                }
                if (totalCogsNoInv > 0) {
                    hppDetails.push({
                        accountCode: posHppMap?.debitAccount || '5.50.01',
                        debit: totalCogsNoInv,
                        credit: 0,
                        description: 'Biaya Penjualan POS (Item Non-Inventory)'
                    }, {
                        accountCode: '5.50.02',
                        debit: 0,
                        credit: totalCogsNoInv,
                        description: 'Beban Langsung POS (Non-Inventory)'
                    });
                }
                if (hppDetails.length > 0) {
                    await tx.postedJournal.create({
                        data: {
                            journalNumber: `JHPP-${dateStr}-${shiftId}`,
                            journalDate: jrnDate,
                            description: `HPP Penjualan POS - Tutup Shift #${shiftId}`,
                            postingType: 'AUTO',
                            transType: 'POS_CLOSING',
                            refId: shiftId,
                            userId: shift.userId,
                            status: 'POSTED',
                            createdBy: 'SYSTEM',
                            details: { create: hppDetails }
                        }
                    });
                }
            }
            const closedShift = await tx.posShift.update({
                where: { id: shiftId },
                data: {
                    status: 'CLOSED',
                    endTime: new Date(),
                    totalSales: totalNetRevenue,
                    endingCash: endingCash,
                    journalId: journalId
                }
            });
            return closedShift;
        });
        return resultShift;
    }
    async getActiveShift(userId) {
        return this.prisma.posShift.findFirst({
            where: { userId, status: 'OPEN' },
            include: {
                sales: {
                    where: { status: 'COMPLETED' },
                    include: {
                        items: {
                            include: { posProduct: true }
                        }
                    }
                }
            }
        });
    }
    async logVoid(data) {
        return this.prisma.posVoidLog.create({
            data: {
                shiftId: data.shiftId,
                posProductId: data.posProductId,
                quantity: data.quantity,
                reason: data.reason,
                createdBy: data.createdBy
            }
        });
    }
};
exports.PosShiftService = PosShiftService;
exports.PosShiftService = PosShiftService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, accounting_service_1.AccountingService])
], PosShiftService);
//# sourceMappingURL=pos-shift.service.js.map