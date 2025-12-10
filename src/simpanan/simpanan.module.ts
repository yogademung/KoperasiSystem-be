import { Module } from '@nestjs/common';
import { AnggotaController } from './anggota/anggota.controller';
import { AnggotaService } from './anggota/anggota.service';
import { SimpananInterestService } from './simpanan-interest.service';
import { PrismaService } from '../database/prisma.service';

@Module({
    controllers: [AnggotaController],
    providers: [AnggotaService, SimpananInterestService, PrismaService],
    exports: [AnggotaService, SimpananInterestService]
})
export class SimpananModule { }
