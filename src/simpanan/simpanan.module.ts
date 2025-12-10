import { Module } from '@nestjs/common';
import { AnggotaController } from './anggota/anggota.controller';
import { AnggotaService } from './anggota/anggota.service';
import { TabrelaController } from './tabrela/tabrela.controller';
import { TabrelaService } from './tabrela/tabrela.service';
import { SimpananInterestService } from './simpanan-interest.service';
import { PrismaService } from '../database/prisma.service';

@Module({
    controllers: [AnggotaController, TabrelaController],
    providers: [AnggotaService, TabrelaService, SimpananInterestService, PrismaService],
    exports: [AnggotaService, TabrelaService, SimpananInterestService]
})
export class SimpananModule { }
