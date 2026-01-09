import { PrismaService } from '../database/prisma.service';
import { TemplateService } from './template.service';
import { ReportMetadataService } from './report-metadata.service';
import { ReportGeneratorService } from './report-generator.service';
export declare class ReportService {
    private prisma;
    private templateService;
    private metadataService;
    private generatorService;
    constructor(prisma: PrismaService, templateService: TemplateService, metadataService: ReportMetadataService, generatorService: ReportGeneratorService);
    getReportInfo(templateCode: string): Promise<{
        template: any;
        metadata: import("./interfaces/report.interfaces").ReportMetadata;
    }>;
    generateReportByCode(templateCode: string, format: 'PDF' | 'EXCEL', parameters: Record<string, any>, userId: string): Promise<{
        success: boolean;
        logId: any;
        fileUrl: string;
        fileSize: any;
        generatedAt: any;
    }>;
    getTemplatesByProduct(productModule: string): Promise<any>;
    getDefaultTemplates(): Promise<any>;
}
