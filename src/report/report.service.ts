import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { TemplateService } from './template.service';
import { ReportMetadataService } from './report-metadata.service';
import { ReportGeneratorService } from './report-generator.service';

@Injectable()
export class ReportService {
  constructor(
    private prisma: PrismaService,
    private templateService: TemplateService,
    private metadataService: ReportMetadataService,
    private generatorService: ReportGeneratorService,
  ) {}

  // Main orchestration service for complex report operations
  // This service coordinates between template, metadata, and generator services

  async getReportInfo(templateCode: string) {
    const template = await this.templateService.findByCode(templateCode);
    const metadata = await this.metadataService.getMetadata(
      template.productModule,
    );

    return {
      template,
      metadata,
    };
  }

  async generateReportByCode(
    templateCode: string,
    format: 'PDF' | 'EXCEL',
    parameters: Record<string, any>,
    userId: string,
  ) {
    const template = await this.templateService.findByCode(templateCode);

    return this.generatorService.generate(
      {
        templateId: template.id,
        format,
        parameters,
      },
      userId,
    );
  }

  // Helper methods for common report operations
  async getTemplatesByProduct(productModule: string) {
    return this.templateService.findAll({ productModule });
  }

  async getDefaultTemplates() {
    return this.templateService.findAll({ isDefault: true });
  }
}
