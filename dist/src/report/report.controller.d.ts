import { TemplateService } from './template.service';
import { ReportMetadataService } from './report-metadata.service';
import { ReportGeneratorService } from './report-generator.service';
import { CreateTemplateDto, UpdateTemplateDto, GenerateReportDto } from './dto/report.dto';
export declare class ReportController {
    private templateService;
    private metadataService;
    private generatorService;
    constructor(templateService: TemplateService, metadataService: ReportMetadataService, generatorService: ReportGeneratorService);
    getMetadata(productModule: string): Promise<import("./interfaces/report.interfaces").ReportMetadata>;
    getAllProductModules(): Promise<string[]>;
    listTemplates(productModule?: string, category?: string, isDefault?: string): Promise<{
        templates: any;
        total: any;
    }>;
    getTemplate(id: number): Promise<any>;
    getTemplateByCode(code: string): Promise<any>;
    createTemplate(dto: CreateTemplateDto, req: any): Promise<any>;
    updateTemplate(id: number, dto: UpdateTemplateDto, req: any): Promise<any>;
    deleteTemplate(id: number, req: any): Promise<any>;
    createTemplateVersion(id: number, name: string, req: any): Promise<any>;
    generateReport(dto: GenerateReportDto, req: any): Promise<{
        success: boolean;
        logId: any;
        fileUrl: string;
        fileSize: any;
        generatedAt: any;
    }>;
    previewTemplate(templateId: number, format?: 'PDF' | 'EXCEL'): Promise<{
        success: boolean;
        logId: any;
        fileUrl: string;
        fileSize: any;
        generatedAt: any;
        message: string;
    }>;
    getGenerationLogs(limit?: string, offset?: string): Promise<{
        logs: any;
        total: any;
        limit: number;
        offset: number;
    }>;
    getGenerationLog(id: number): Promise<any>;
}
