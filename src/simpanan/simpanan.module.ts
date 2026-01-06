import { Module } from '@nestjs/common';
import { PrismaModule } from '../database/prisma.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MonthEndModule } from '../month-end/month-end.module';
import { AnggotaController } from './anggota/anggota.controller';
import { AnggotaService } from './anggota/anggota.service';
import { TabrelaController } from './tabrela/tabrela.controller';
import { TabrelaService } from './tabrela/tabrela.service';
import { DepositoController } from './deposito/deposito.controller';
import { DepositoService } from './deposito/deposito.service';
import { BrahmacariController } from './brahmacari/brahmacari.controller';
import { BrahmacariService } from './brahmacari/brahmacari.service';
import { BalimesariController } from './balimesari/balimesari.controller';
import { BalimesariService } from './balimesari/balimesari.service';
import { WanaprastaController } from './wanaprasta/wanaprasta.controller';
import { WanaprastaService } from './wanaprasta/wanaprasta.service';
import { SimpananInterestService } from './simpanan-interest.service';

@Module({
    imports: [PrismaModule, EventEmitterModule.forRoot(), MonthEndModule],
    controllers: [
        AnggotaController,
        TabrelaController,
        DepositoController,
        BrahmacariController,
        BalimesariController,
        WanaprastaController
    ],
    providers: [
        AnggotaService,
        TabrelaService,
        DepositoService,
        BrahmacariService,
        BalimesariService,
        WanaprastaService,
        SimpananInterestService
    ],
    exports: [
        AnggotaService,
        TabrelaService,
        DepositoService,
        BrahmacariService,
        BalimesariService,
        WanaprastaService,
        SimpananInterestService
    ]
})
export class SimpananModule { }
