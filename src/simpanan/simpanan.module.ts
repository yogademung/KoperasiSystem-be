import { Module } from '@nestjs/common';
import { AnggotaController } from './anggota/anggota.controller';
import { AnggotaService } from './anggota/anggota.service';
import { TabrelaController } from './tabrela/tabrela.controller';
import { TabrelaService } from './tabrela/tabrela.service';
import { DepositoController } from './deposito/deposito.controller';
import { DepositoService } from './deposito/deposito.service';
import { SimpananInterestService } from './simpanan-interest.service';
// PrismaService is provided globally by PrismaModule, no need to add to providers here if PrismaModule is Global.
// If explicitly importing, we add imports: [PrismaModule]

@Module({
    controllers: [AnggotaController, TabrelaController, DepositoController],
    providers: [AnggotaService, TabrelaService, DepositoService, SimpananInterestService],
    exports: [AnggotaService, TabrelaService, DepositoService, SimpananInterestService]
})
export class SimpananModule { }
