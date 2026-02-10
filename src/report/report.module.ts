import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { ReportMetadataService } from './report-metadata.service';
import { ReportGeneratorService } from './report-generator.service';
import { TemplateService } from './template.service';
import { DataProviderService } from './data-provider.service';
import { PdfRendererService } from './pdf-renderer.service';
import { ExcelRendererService } from './excel-renderer.service';
import { PrismaModule } from '../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReportController],
  providers: [
    ReportService,
    ReportMetadataService,
    ReportGeneratorService,
    TemplateService,
    DataProviderService,
    PdfRendererService,
    ExcelRendererService,
  ],
  exports: [ReportService, ReportMetadataService, ReportGeneratorService],
})
export class ReportModule {}
