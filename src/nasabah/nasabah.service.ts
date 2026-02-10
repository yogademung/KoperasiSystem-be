import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateNasabahDto } from './dto/create-nasabah.dto';
import { UpdateNasabahDto } from './dto/update-nasabah.dto';

@Injectable()
export class NasabahService {
  constructor(private prisma: PrismaService) {}

  async create(createNasabahDto: CreateNasabahDto) {
    return this.prisma.nasabah.create({
      data: createNasabahDto,
    });
  }

  async findAll() {
    return this.prisma.nasabah.findMany({
      orderBy: { createdAt: 'desc' },
      where: { isActive: true },
    });
  }

  async findOne(id: number) {
    const nasabah = await this.prisma.nasabah.findUnique({
      where: { id },
    });

    if (!nasabah) {
      throw new NotFoundException(`Nasabah #${id} not found`);
    }

    return nasabah;
  }

  async update(id: number, updateNasabahDto: UpdateNasabahDto) {
    await this.findOne(id); // Check existence
    return this.prisma.nasabah.update({
      where: { id },
      data: updateNasabahDto,
    });
  }

  async searchNasabah(query: string, type?: string) {
    if (!query) return [];

    // Search condition for member fields
    const whereInput: any = {
      isActive: true,
      OR: [
        { nama: { contains: query } },
        { noKtp: { contains: query } },
        // Check in account numbers
        { anggota: { some: { accountNumber: { contains: query } } } },
        { tabungan: { some: { noTab: { contains: query } } } },
        { brahmacari: { some: { noBrahmacari: { contains: query } } } },
        { balimesari: { some: { noBalimesari: { contains: query } } } },
        { wanaprasta: { some: { noWanaprasta: { contains: query } } } },
        { kredit: { some: { nomorKredit: { contains: query } } } },
      ],
    };

    const results = await this.prisma.nasabah.findMany({
      where: whereInput,
      take: 10,
      include: {
        anggota: { where: { status: 'A' } },
        tabungan: { where: { status: 'A' } },
        brahmacari: { where: { status: 'A' } },
        balimesari: { where: { status: 'A' } },
        wanaprasta: { where: { status: 'A' } },
        kredit: { where: { status: 'A' } }, // Match getPortfolio convention
      },
    });

    // If specific type filter requested, we can filter the *accounts* in the response
    // But for now, returning full portfolio for context is better
    return results;
  }

  async getPortfolio(id: number) {
    const nasabah = await this.prisma.nasabah.findUnique({
      where: { id },
      include: {
        anggota: true,
        tabungan: { where: { status: 'A' } },
        deposito: { where: { status: 'A' } },
        brahmacari: { where: { status: 'A' } },
        balimesari: { where: { status: 'A' } },
        wanaprasta: { where: { status: 'A' } },
        kredit: { where: { status: 'A' } },
      },
    });

    if (!nasabah) throw new NotFoundException(`Nasabah #${id} not found`);
    return nasabah;
  }

  async remove(id: number) {
    const nasabah = await this.prisma.nasabah.findUnique({
      where: { id },
      include: {
        anggota: true,
        tabungan: true,
        deposito: true,
        brahmacari: true,
        balimesari: true,
        wanaprasta: true,
        kredit: true,
      },
    });

    if (!nasabah) {
      throw new NotFoundException(`Nasabah #${id} not found`);
    }

    const activeProducts: string[] = [];
    if (nasabah.anggota?.length > 0) activeProducts.push('Simpanan Anggota');
    if (nasabah.tabungan?.length > 0) activeProducts.push('Tabungan Sukarela');
    if (nasabah.deposito?.length > 0)
      activeProducts.push('Deposito (Simpanan Jangka)');
    if (nasabah.brahmacari?.length > 0) activeProducts.push('Brahmacari');
    if (nasabah.balimesari?.length > 0) activeProducts.push('Bali Mesari');
    if (nasabah.wanaprasta?.length > 0) activeProducts.push('Wanaprasta');
    if (nasabah.kredit?.length > 0) activeProducts.push('Kredit/Pinjaman');

    if (activeProducts.length > 0) {
      throw new BadRequestException(
        `Gagal menghapus: Nasabah masih memiliki ${activeProducts.join(', ')}`,
      );
    }

    return this.prisma.nasabah.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
