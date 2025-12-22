import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { join } from 'path';
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
import { AccountingModule } from './accounting/accounting.module';
import { AssetModule } from './accounting/asset/asset.module';
import { ReportModule } from './report/report.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot({ global: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    NasabahModule,
    KreditModule,
    SimpananModule,
    AkuntansiModule,
    LaporanModule,
    AccountingModule,
    AssetModule,
    ReportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

