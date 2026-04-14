import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { AccountingService } from 'src/accounting/accounting.service';

@Injectable()
export class PosShiftService {
  constructor(private prisma: PrismaService, private accountingService: AccountingService) {}

  // 1. Buka Shift Kasir
  async openShift(userId: number, startingCash: number = 0) {
    // Check if there's an open shift for this user
    const existing = await this.prisma.posShift.findFirst({
      where: { userId, status: 'OPEN' }
    });
    if (existing) throw new BadRequestException('User already has an open shift (Shift ID: ' + existing.id + ')');

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
              accountCode: '1.01.02', // Asumsi Kasir POS
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
      } catch (error) {
        console.error('Failed to post start shift journal for POS:', error);
      }
    }

    return shift;
  }

  // 2. Tutup Shift Kasir (End of Day / Rekapitulasi Jurnal)
  async closeShift(shiftId: number, endingCash: number) {
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

      if (!shift) throw new NotFoundException('Shift not found');
      if (shift.status === 'CLOSED') throw new BadRequestException('Shift is already closed');

      // Ambil Mapping Akunting untuk POS
      const posSaleMap = await tx.productCoaMapping.findUnique({ where: { transType: 'POS_SALE' } });
      const posHppMap  = await tx.productCoaMapping.findUnique({ where: { transType: 'POS_HPP' } });
      const posDiscountMap = await tx.productCoaMapping.findUnique({ where: { transType: 'POS_DISCOUNT' } });

      // ── Pisahkan item berdasarkan apakah terhubung ke inventory ──────
      let totalNetRevenue   = 0;
      let totalDiscount     = 0;

      // Item WITH inventory — pakai COGS untuk HPP & kurangi persediaan
      let totalRevWithInv   = 0;  // gross revenue dari item ber-inventory
      let totalCogs         = 0;  // total HPP item ber-inventory (akan credit Persediaan)

      // Item WITHOUT inventory — pakai cogsPrice untuk Beban Langsung (bukan Persediaan)
      let totalRevNoInv     = 0;  // gross revenue dari item tanpa inventory
      let totalCogsNoInv    = 0;  // total cost item tanpa inventory (akan credit Beban Langsung)

      shift.sales.forEach(sale => {
        totalNetRevenue += Number(sale.totalAmount);
        totalDiscount   += Number(sale.discountAmount || 0);

        sale.items.forEach(item => {
          const qty       = Number(item.quantity);
          const sellPrice = Number(item.unitPrice);
          const cogsPrice = Number(item.cogsPrice);

          const hasInventory = (item.posProduct.recipes?.length || 0) > 0;

          if (hasInventory) {
            totalRevWithInv += qty * sellPrice;
            totalCogs       += qty * cogsPrice;
          } else {
            totalRevNoInv   += qty * sellPrice;
            totalCogsNoInv  += qty * cogsPrice;   // bisa 0 jika produk tanpa HPP
          }
        });
      });

      const totalGrossRevenue = totalRevWithInv + totalRevNoInv;
      let journalId: number | null = null;

      if (totalGrossRevenue > 0 || endingCash > 0) {
        const jrnDate = new Date();
        const dateStr = `${jrnDate.getFullYear()}${(jrnDate.getMonth()+1).toString().padStart(2,'0')}${jrnDate.getDate().toString().padStart(2,'0')}`;

        // ── Jurnal 1: Revenue + Setor Kas ──────────────────────────────
        const revDetails: any[] = [];

        if (totalNetRevenue > 0) {
          // DR Kas POS = penerimaan bersih
          revDetails.push({
            accountCode: posSaleMap?.debitAccount || '1.01.02',
            debit: totalNetRevenue,
            credit: 0,
            description: 'Penerimaan Kas Kasir POS'
          });
          // DR Diskon (jika ada)
          if (totalDiscount > 0) {
            revDetails.push({
              accountCode: posDiscountMap?.debitAccount || '5.60.01',
              debit: totalDiscount,
              credit: 0,
              description: 'Diskon Penjualan POS'
            });
          }
          // CR Pendapatan = gross revenue
          revDetails.push({
            accountCode: posSaleMap?.creditAccount || '4.30.01',
            debit: 0,
            credit: totalGrossRevenue,
            description: 'Pendapatan Penjualan POS'
          });
        }

        // DR Kas Kantor Main = endingCash (setor fisik)
        // CR Kas POS = endingCash
        if (endingCash > 0) {
          revDetails.push(
            {
              accountCode: '1.01.01',
              debit: endingCash,
              credit: 0,
              description: 'Setor Kas ke Kas Kantor (Akhir Shift)'
            },
            {
              accountCode: posSaleMap?.debitAccount || '1.01.02',
              debit: 0,
              credit: endingCash,
              description: 'Kas Transit Kasir POS (Keluar)'
            }
          );
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

        // ── Jurnal 2: HPP/Cost (terpisah) ──────────────────────────────
        const hppDetails: any[] = [];

        // HPP item ber-inventory → DR HPP, CR Persediaan
        if (totalCogs > 0) {
          hppDetails.push(
            {
              accountCode: posHppMap?.debitAccount || '5.50.01',
              debit: totalCogs,
              credit: 0,
              description: 'HPP Penjualan POS (Item Berbasis Inventory)'
            },
            {
              accountCode: posHppMap?.creditAccount || '1.10.01',
              debit: 0,
              credit: totalCogs,
              description: 'Pengurangan Persediaan POS'
            }
          );
        }

        // HPP item tanpa inventory → DR Beban Langsung, CR Beban Langsung
        if (totalCogsNoInv > 0) {
          hppDetails.push(
            {
              accountCode: posHppMap?.debitAccount || '5.50.01',
              debit: totalCogsNoInv,
              credit: 0,
              description: 'Biaya Penjualan POS (Item Non-Inventory)'
            },
            {
              accountCode: '5.50.02',
              debit: 0,
              credit: totalCogsNoInv,
              description: 'Beban Langsung POS (Non-Inventory)'
            }
          );
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

      // Tutup Shift
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

  // 3. Get Active Shift
  async getActiveShift(userId: number) {
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

  // 4. Catat Void Item
  async logVoid(data: { shiftId: number; posProductId: number; quantity: number; reason: string; createdBy: string }) {
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
}
