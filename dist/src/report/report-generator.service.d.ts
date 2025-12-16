import { PrismaService } from '../database/prisma.service';
import { GenerateReportDto } from './dto/report.dto';
import { TemplateService } from './template.service';
export declare class ReportGeneratorService {
    private prisma;
    private templateService;
    constructor(prisma: PrismaService, templateService: TemplateService);
    generate(dto: GenerateReportDto, userId: string): Promise<{
        success: boolean;
        logId: number;
        fileUrl: string | null;
        fileSize: number;
        generatedAt: Date;
        message: string;
    }>;
    generatePreview(templateId: number, format: 'PDF' | 'EXCEL'): Promise<{
        success: boolean;
        message: string;
        template: {
            id: number;
            code: string;
            name: string;
        };
    }>;
    getGenerationLogs(limit?: number, offset?: number): Promise<{
        logs: ({
            template: {
                code: string;
                name: string;
            };
        } & {
            recordId: string | null;
            format: string;
            parameters: import("@prisma/client/runtime/library").JsonValue | null;
            status: string;
            errorMessage: string | null;
            filePath: string | null;
            fileSize: number | null;
            generatedBy: string | null;
            generatedAt: Date;
            id: number;
            templateId: number;
        })[];
        total: number;
        limit: number;
        offset: number;
    }>;
    getGenerationLog(id: number): Promise<{
        template: {
            code: string;
            name: string;
            productModule: string;
        };
    } & {
        recordId: string | null;
        format: string;
        parameters: import("@prisma/client/runtime/library").JsonValue | null;
        status: string;
        errorMessage: string | null;
        filePath: string | null;
        fileSize: number | null;
        generatedBy: string | null;
        generatedAt: Date;
        id: number;
        templateId: number;
    }>;
    printPassbook(options: {
        accountNumber: string;
        productType: string;
        startLine?: number;
        mode: 'NEW_ONLY' | 'ALL' | 'RANGE';
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    getPassbookState(accountNumber: string): Promise<{
        id: number;
        updatedAt: Date;
        accountNumber: string;
        productType: string;
        lastPrintedTransId: number | null;
        lastPrintedLine: number;
        totalLinesPrinted: number;
    } | null>;
    updatePassbookState(accountNumber: string, productType: string, lastPrintedTransId: number, lastPrintedLine: number): Promise<{
        id: number;
        updatedAt: Date;
        accountNumber: string;
        productType: string;
        lastPrintedTransId: number | null;
        lastPrintedLine: number;
        totalLinesPrinted: number;
    }>;
}
