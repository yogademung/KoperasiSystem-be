import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateBusinessUnitDto, UpdateBusinessUnitDto } from './dto/business-unit.dto';

@Injectable()
export class BusinessUnitService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.businessUnit.findMany({
            orderBy: { id: 'asc' }
        });
    }

    async findActive() {
        return this.prisma.businessUnit.findMany({
            where: { isActive: true },
            orderBy: { id: 'asc' }
        });
    }

    async findOne(id: number) {
        return this.prisma.businessUnit.findUnique({
            where: { id }
        });
    }

    async create(dto: CreateBusinessUnitDto) {
        return this.prisma.businessUnit.create({
            data: dto
        });
    }

    async update(id: number, dto: UpdateBusinessUnitDto) {
        return this.prisma.businessUnit.update({
            where: { id },
            data: dto
        });
    }

    async delete(id: number) {
        // Logic check: prevent deletion if linked to accounts or cost centers
        const linkedAccounts = await this.prisma.journalAccount.count({ where: { businessUnitId: id } });
        const linkedCostCenters = await this.prisma.costCenter.count({ where: { businessUnitId: id } });

        if (linkedAccounts > 0 || linkedCostCenters > 0) {
            throw new Error('Business Unit cannot be deleted because it is still linked to accounts or cost centers.');
        }

        return this.prisma.businessUnit.delete({
            where: { id }
        });
    }
}
