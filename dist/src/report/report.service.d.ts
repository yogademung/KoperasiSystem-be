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
        template: {
            id: number;
            code: string;
            name: string;
            description: string | null;
            productModule: string;
            category: string;
            jsonSchema: import("@prisma/client/runtime/library").JsonValue;
            paperSize: string;
            orientation: string;
            customWidth: import("@prisma/client/runtime/library").Decimal | null;
            customHeight: import("@prisma/client/runtime/library").Decimal | null;
            marginTop: import("@prisma/client/runtime/library").Decimal;
            marginBottom: import("@prisma/client/runtime/library").Decimal;
            marginLeft: import("@prisma/client/runtime/library").Decimal;
            marginRight: import("@prisma/client/runtime/library").Decimal;
            version: number;
            isDefault: boolean;
            isActive: boolean;
            parentId: number | null;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
        };
        metadata: import("./interfaces/report.interfaces").ReportMetadata;
    }>;
    generateReportByCode(templateCode: string, format: 'PDF' | 'EXCEL', parameters: Record<string, any>, userId: string): Promise<{
        success: boolean;
        logId: number;
        fileUrl: string | null;
        fileSize: number;
        generatedAt: Date;
        message: string;
    }>;
    getTemplatesByProduct(productModule: string): Promise<{
        id: number;
        code: string;
        name: string;
        description: string | null;
        productModule: string;
        category: string;
        version: number;
        isDefault: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date | null;
    }[]>;
    getDefaultTemplates(): Promise<{
        id: number;
        code: string;
        name: string;
        description: string | null;
        productModule: string;
        category: string;
        version: number;
        isDefault: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date | null;
    }[]>;
}
