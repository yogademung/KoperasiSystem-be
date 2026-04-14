import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class ProductCategoryService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; description?: string; parentId?: number }) {
    const level = data.parentId ? 2 : 1;
    return this.prisma.productCategory.create({
      data: {
        ...data,
        level,
        createdBy: 'SYSTEM'
      }
    });
  }

  async findAll() {
    return this.prisma.productCategory.findMany({
      include: { children: true, parent: true }
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.productCategory.findUnique({
      where: { id },
      include: { children: true, parent: true }
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: number, data: { name?: string; description?: string; isActive?: boolean }) {
    return this.prisma.productCategory.update({
      where: { id },
      data
    });
  }

  async remove(id: number) {
    return this.prisma.productCategory.delete({ where: { id } });
  }
}
