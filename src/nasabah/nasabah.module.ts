import { Module } from '@nestjs/common';
import { NasabahController } from './nasabah.controller';
import { NasabahService } from './nasabah.service';
import { PrismaService } from '../database/prisma.service';

@Module({
  controllers: [NasabahController],
  providers: [NasabahService, PrismaService],
  exports: [NasabahService],
})
export class NasabahModule {}
