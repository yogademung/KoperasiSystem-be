import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class PosShiftService {
  constructor(private prisma: PrismaService) {}

  // 1. Buka Shift Kasir
  async openShift(userId: number, startingCash: number = 0) {
    // Check if there's an open shift for this user
    const existing = await this.prisma.posShift.findFirst({
      where: { userId, status: 'OPEN' }
    });
    if (existing) throw new BadRequestException('User already has an open shift (Shift ID: ' + existing.id + ')');

    return this.prisma.posShift.create({
      data: {
        userId,
        startingCash,
        shiftDate: new Date(),
        status: 'OPEN'
      }
    });
  }

  // 2. Tutup Shift Kasir (End of Day / Rekapitulasi Jurnal)
  async closeShift(shiftId: number, endingCash: number) {
    return this.prisma.$transaction(async (tx) => {
      const shift = await tx.posShift.findUnique({
        where: { id: shiftId },
        include: { sales: { include: { items: true } } }
      });

      if (!shift) throw new NotFoundException('Shift not found');
      if (shift.status === 'CLOSED') throw new BadRequestException('Shift is already closed');

      // Kalkulasi Total Penjualan dan HPP dari keseluruhan transaksi di shift ini
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

      // Validasi selisih kas (Bisa untuk laporan selisih, disini kita catat saja)
      // Expected Cash = starting cash + total cash sales (assuming all sales are cash for now)
      
      let journalId: number | null = null;

      // Buat Jurnal Akuntansi jika ada transaksi
      if (totalRevenue > 0) {
        // Generate nomor jurnal
        const jrnDate = new Date();
        const jrnNo = `JPOS-${jrnDate.getFullYear()}${(jrnDate.getMonth()+1).toString().padStart(2,'0')}${jrnDate.getDate().toString().padStart(2,'0')}-${shiftId}`;

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
                // Jurnal Pendapatan (Debit Kas, Kredit Pendapatan)
                { accountCode: '111-10', debit: totalRevenue, credit: 0, description: 'Penerimaan Kasir POS' }, // Dummy Akun Kas
                { accountCode: '411-10', debit: 0, credit: totalRevenue, description: 'Pendapatan Penjualan POS' }, // Dummy Akun Pendapatan

                // Jurnal Harga Pokok Penjualan (Debit HPP, Kredit Persediaan)
                // Hanya dieksekusi jika ada HPP
                ...(totalCogs > 0 ? [
                  { accountCode: '511-10', debit: totalCogs, credit: 0, description: 'HPP Penjualan POS' }, // Dummy Akun HPP
                  { accountCode: '114-10', debit: 0, credit: totalCogs, description: 'Pengurangan Persediaan POS' } // Dummy Akun Persediaan
                ] : [])
              ]
            }
          }
        });
        journalId = journal.id;
      }

      // Tutup Shift
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

  // 3. Get Active Shift
  async getActiveShift(userId: number) {
    return this.prisma.posShift.findFirst({
      where: { userId, status: 'OPEN' },
      include: { sales: true }
    });
  }
}
