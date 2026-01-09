import { PrismaService } from '../database/prisma.service';
import { CreateNasabahDto } from './dto/create-nasabah.dto';
import { UpdateNasabahDto } from './dto/update-nasabah.dto';
export declare class NasabahService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createNasabahDto: CreateNasabahDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: number): Promise<any>;
    update(id: number, updateNasabahDto: UpdateNasabahDto): Promise<any>;
    searchNasabah(query: string, type?: string): Promise<any>;
    getPortfolio(id: number): Promise<any>;
    remove(id: number): Promise<any>;
}
