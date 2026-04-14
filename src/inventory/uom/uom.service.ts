import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class UomService {
  constructor(private prisma: PrismaService) {}

  async create(data: { code: string; name: string }) {
    return this.prisma.uom.create({ data });
  }

  async findAll() {
    return this.prisma.uom.findMany();
  }

  async update(id: number, data: { code?: string; name?: string; isActive?: boolean }) {
    return this.prisma.uom.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.uom.delete({ where: { id } });
  }
}
