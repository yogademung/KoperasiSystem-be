import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class MobileService {
  constructor(private prisma: PrismaService) {}

  async getProfileAndBalance(nasabahId: number) {
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

    if (!nasabah) throw new NotFoundException('Nasabah not found');

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

  async getWithdrawals(nasabahId: number) {
    return this.prisma.withdrawalRequest.findMany({
      where: { nasabahId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createWithdrawal(nasabahId: number, data: any) {
    const { amount, deliveryAddress, scheduledDate, timeSlot, notes } = data;
    
    let dateObj: Date;
    try {
      dateObj = new Date(scheduledDate);
      if (isNaN(dateObj.getTime())) {
        throw new Error('Invalid date');
      }
    } catch (e) {
      throw new BadRequestException('Format tanggal tidak valid');
    }

    const day = dateObj.getDay();
    // 0 = Sunday, 6 = Saturday
    if (day === 0 || day === 6) {
      throw new BadRequestException('Penarikan hanya bisa dijadwalkan hari Senin - Jumat');
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

  async getWithdrawal(nasabahId: number, id: number) {
    const req = await this.prisma.withdrawalRequest.findFirst({
      where: { nasabahId, id }
    });
    if (!req) throw new NotFoundException('Withdrawal request not found');
    return req;
  }

  async getTransactions(nasabahId: number) {
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
}
