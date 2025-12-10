import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { NasabahModule } from './nasabah/nasabah.module';
import { KreditModule } from './kredit/kredit.module';
import { SimpananModule } from './simpanan/simpanan.module';
import { AkuntansiModule } from './akuntansi/akuntansi.module';
import { LaporanModule } from './laporan/laporan.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    NasabahModule,
    KreditModule,
    SimpananModule,
    AkuntansiModule,
    LaporanModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
