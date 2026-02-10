import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

@Injectable()
export class KreditReportService {
  constructor(private prisma: PrismaService) {}

  async getKolektibilitas(period: string) {
    const [year, month] = period.split('-');
    const endDate = new Date(parseInt(year), parseInt(month), 0); // Last day of month

    // Get all active credits
    const credits = await this.prisma.debiturKredit.findMany({
      where: {
        status: { not: 'CLOSED' },
      },
      include: {
        jadwal: {
          where: {
            status: 'UNPAID',
            tglJatuhTempo: { lte: endDate },
          },
          orderBy: { angsuranKe: 'asc' },
        },
        nasabah: true,
        realisasi: true,
      },
    });

    // Calculate collectibility
    const result = {
      totalKredit: credits.length,
      totalOutstanding: 0,
      lancar: { count: 0, outstanding: 0 },
      kurangLancar: { count: 0, outstanding: 0 },
      diragukan: { count: 0, outstanding: 0 },
      macet: { count: 0, outstanding: 0 },
    };

    for (const credit of credits) {
      const sisaPokok = credit.jadwal.reduce(
        (sum, j) => sum + parseFloat(j.sisaPokok.toString()),
        0,
      );
      result.totalOutstanding += sisaPokok;

      // Calculate days overdue from oldest unpaid installment
      const overdueInstallment = credit.jadwal[0];
      if (!overdueInstallment) {
        // Lancar - no overdue
        result.lancar.count++;
        result.lancar.outstanding += sisaPokok;
        continue;
      }

      const daysOverdue = Math.floor(
        (endDate.getTime() -
          new Date(overdueInstallment.tglJatuhTempo).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      if (daysOverdue <= 0) {
        result.lancar.count++;
        result.lancar.outstanding += sisaPokok;
      } else if (daysOverdue <= 90) {
        result.kurangLancar.count++;
        result.kurangLancar.outstanding += sisaPokok;
      } else if (daysOverdue <= 180) {
        result.diragukan.count++;
        result.diragukan.outstanding += sisaPokok;
      } else {
        result.macet.count++;
        result.macet.outstanding += sisaPokok;
      }
    }

    return result;
  }

  async generateKolektibilitasPDF(period: string): Promise<Buffer> {
    const data = await this.getKolektibilitas(period);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc
        .fontSize(16)
        .text('LAPORAN KOLEKTIBILITAS KREDIT', { align: 'center' });
      doc.fontSize(12).text(`Periode: ${period}`, { align: 'center' });
      doc.moveDown(2);

      // Summary
      doc.fontSize(12).text(`Total Kredit: ${data.totalKredit}`);
      doc.text(
        `Total Outstanding: Rp ${data.totalOutstanding.toLocaleString('id-ID')}`,
      );
      doc.moveDown();

      // Details
      doc.fontSize(14).text('Detail Kolektibilitas:', { underline: true });
      doc.moveDown();
      doc.fontSize(11);
      doc.text(
        `Lancar (Kol 1): ${data.lancar.count} kredit - Rp ${data.lancar.outstanding.toLocaleString('id-ID')}`,
      );
      doc.text(
        `Kurang Lancar (Kol 2): ${data.kurangLancar.count} kredit - Rp ${data.kurangLancar.outstanding.toLocaleString('id-ID')}`,
      );
      doc.text(
        `Diragukan (Kol 3): ${data.diragukan.count} kredit - Rp ${data.diragukan.outstanding.toLocaleString('id-ID')}`,
      );
      doc.text(
        `Macet (Kol 4-5): ${data.macet.count} kredit - Rp ${data.macet.outstanding.toLocaleString('id-ID')}`,
      );

      doc.end();
    });
  }

  async getDaftarKredit(status?: string) {
    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const credits = await this.prisma.debiturKredit.findMany({
      where,
      include: {
        nasabah: true,
        realisasi: {
          orderBy: { tglRealisasi: 'desc' },
          take: 1,
        },
        jadwal: {
          where: { status: 'UNPAID' },
        },
      },
      orderBy: { nomorKredit: 'asc' },
    });

    return credits.map((credit) => {
      const sisaPokok = credit.jadwal.reduce(
        (sum, j) => sum + parseFloat(j.sisaPokok.toString()),
        0,
      );
      const sisaBunga = credit.jadwal.reduce(
        (sum, j) => sum + parseFloat(j.sisaBunga?.toString() || '0'),
        0,
      );

      return {
        nomorKredit: credit.nomorKredit,
        namaDebitur: credit.nasabah.nama,
        jenisKredit: credit.jenisKredit,
        tglRealisasi: credit.realisasi[0]?.tglRealisasi || null,
        nominal: parseFloat(credit.nominalPengajuan.toString()),
        sisaPokok,
        sisaBunga,
        status: credit.status,
      };
    });
  }

  async generateDaftarKreditExcel(status?: string): Promise<any> {
    const data = await this.getDaftarKredit(status);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Daftar Kredit');

    // Headers
    worksheet.columns = [
      { header: 'No. Kredit', key: 'nomorKredit', width: 15 },
      { header: 'Nama Debitur', key: 'namaDebitur', width: 30 },
      { header: 'Jenis Kredit', key: 'jenisKredit', width: 20 },
      { header: 'Tgl. Realisasi', key: 'tglRealisasi', width: 15 },
      { header: 'Plafon', key: 'nominal', width: 15 },
      { header: 'Sisa Pokok', key: 'sisaPokok', width: 15 },
      { header: 'Sisa Bunga', key: 'sisaBunga', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
    ];

    // Add data
    data.forEach((row) => {
      worksheet.addRow({
        ...row,
        tglRealisasi: row.tglRealisasi
          ? new Date(row.tglRealisasi).toLocaleDateString('id-ID')
          : '-',
      });
    });

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    return await workbook.xlsx.writeBuffer();
  }

  async getTunggakan(asOf: string) {
    const asOfDate = new Date(asOf);

    const overdueInstallments = await this.prisma.debiturJadwal.findMany({
      where: {
        status: 'UNPAID',
        tglJatuhTempo: { lt: asOfDate },
      },
      include: {
        debiturKredit: {
          include: {
            nasabah: true,
          },
        },
      },
      orderBy: [{ tglJatuhTempo: 'asc' }],
    });

    return overdueInstallments.map((jadwal) => {
      const daysOverdue = Math.floor(
        (asOfDate.getTime() - new Date(jadwal.tglJatuhTempo).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      // Simple penalty calculation: 0.5% per day, max 10%
      const penaltyRate = Math.min(daysOverdue * 0.005, 0.1);
      const pokokTunggakan = parseFloat(jadwal.pokok.toString());
      const bungaTunggakan = parseFloat(jadwal.bunga.toString());
      const denda = (pokokTunggakan + bungaTunggakan) * penaltyRate;

      return {
        nomorKredit: jadwal.debiturKredit.nomorKredit,
        namaDebitur: jadwal.debiturKredit.nasabah.nama,
        angsuranKe: jadwal.angsuranKe,
        tglJatuhTempo: jadwal.tglJatuhTempo,
        hariTerlambat: daysOverdue,
        pokokTunggakan,
        bungaTunggakan,
        denda,
        totalTunggakan: pokokTunggakan + bungaTunggakan + denda,
      };
    });
  }

  async generateTunggakanPDF(asOf: string): Promise<Buffer> {
    const data = await this.getTunggakan(asOf);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(16).text('LAPORAN TUNGGAKAN & DENDA', { align: 'center' });
      doc.fontSize(12).text(`Per Tanggal: ${asOf}`, { align: 'center' });
      doc.moveDown(2);

      // Summary
      const totalPokok = data.reduce(
        (sum, item) => sum + item.pokokTunggakan,
        0,
      );
      const totalBunga = data.reduce(
        (sum, item) => sum + item.bungaTunggakan,
        0,
      );
      const totalDenda = data.reduce((sum, item) => sum + item.denda, 0);
      const grandTotal = data.reduce(
        (sum, item) => sum + item.totalTunggakan,
        0,
      );

      doc.fontSize(11);
      doc.text(`Total Kredit Menunggak: ${data.length}`);
      doc.text(`Total Pokok: Rp ${totalPokok.toLocaleString('id-ID')}`);
      doc.text(`Total Bunga: Rp ${totalBunga.toLocaleString('id-ID')}`);
      doc.text(`Total Denda: Rp ${totalDenda.toLocaleString('id-ID')}`);
      doc.text(`Grand Total: Rp ${grandTotal.toLocaleString('id-ID')}`);
      doc.moveDown(2);

      // Details
      doc.fontSize(10);
      data.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.nomorKredit} - ${item.namaDebitur}`);
        doc.text(
          `   Angsuran ke-${item.angsuranKe}, Jatuh Tempo: ${new Date(item.tglJatuhTempo).toLocaleDateString('id-ID')}`,
        );
        doc.text(
          `   Terlambat: ${item.hariTerlambat} hari, Total: Rp ${item.totalTunggakan.toLocaleString('id-ID')}`,
        );
        doc.moveDown(0.5);
      });

      doc.end();
    });
  }
}
