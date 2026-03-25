import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class VendorService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; contactName?: string; phone?: string; email?: string; address?: string }) {
    const vendor = await this.prisma.vendor.create({ 
      data: {
        ...data,
        code: `TMP-${Date.now()}` // Temporary unique code
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

  async findOne(id: number) {
    const vendor = await this.prisma.vendor.findUnique({ where: { id } });
    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  async update(id: number, data: any) {
    return this.prisma.vendor.update({ where: { id }, data });
  }

  async remove(id: number) {
    const historyCount = await this.prisma.apInvoice.count({ where: { vendorId: id } });
    if (historyCount > 0) {
      throw new BadRequestException('Vendor tidak dapat dihapus karena telah memiliki riwayat transaksi (Tagihan Hutang).');
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
      
      if (diffTime <= 0) vm.current += remaining;
      else if (diffTime <= 30) vm.days1_30 += remaining;
      else if (diffTime <= 60) vm.days31_60 += remaining;
      else if (diffTime <= 90) vm.days61_90 += remaining;
      else vm.older += remaining;
    });

    return Array.from(vendorMap.values());
  }
}
