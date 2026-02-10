import { Module } from '@nestjs/common';
import { PrismaModule } from '../database/prisma.module';
import { LaporanService } from './laporan.service';
import { LaporanController } from './laporan.controller';
import { PdfService } from './pdf.service';
import { ExcelService } from './excel.service';
import { PrismaService } from '../database/prisma.service';

@Module({
  imports: [PrismaModule],
  controllers: [LaporanController],
  providers: [LaporanService, PdfService, ExcelService],
  exports: [LaporanService],
})
export class LaporanModule {}
