import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class WarehouseService {
  constructor(private prisma: PrismaService) {}

  async create(data: { code: string; name: string; address?: string }) {
    return this.prisma.warehouse.create({ data });
  }

  async findAll() {
    return this.prisma.warehouse.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async findOne(id: number) {
    const warehouse = await this.prisma.warehouse.findUnique({ where: { id } });
    if (!warehouse) throw new NotFoundException('Warehouse not found');
    return warehouse;
  }

  async update(id: number, data: any) {
    return this.prisma.warehouse.update({ where: { id }, data });
  }

  async remove(id: number) {
    const history1 = await this.prisma.goodsReceipt.count({ where: { warehouseId: id } });
    const history2 = await this.prisma.warehouseStock.count({ where: { warehouseId: id, quantity: { gt: 0 } } });

    if (history1 > 0 || history2 > 0) {
      throw new BadRequestException('Master Gudang tidak dapat dihapus karena tersangkut histori penerimaan atau masih memiliki sisa stok berjalan.');
    }
    
    return this.prisma.warehouse.delete({ where: { id } });
  }
}
