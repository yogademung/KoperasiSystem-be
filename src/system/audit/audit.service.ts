import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    tableName?: string;
    recordId?: string;
    action?: string;
    userId?: number;
    page?: number;
    limit?: number;
  }) {
    const { tableName, recordId, action, userId, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (tableName) where.tableName = tableName;
    if (recordId) where.recordId = recordId;
    if (action) where.action = action;
    if (userId) where.userId = Number(userId);

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              fullName: true,
              username: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page: Number(page),
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    return this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            fullName: true,
            username: true,
          },
        },
      },
    });
  }

  async create(data: any) {
    return this.prisma.auditLog.create({
      data,
    });
  }
}
