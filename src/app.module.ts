import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
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
