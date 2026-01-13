import { PrismaService } from '../database/prisma.service';
import { GenerateReportDto } from './dto/report.dto';
import { TemplateService } from './template.service';
import { DataProviderService } from './data-provider.service';
import { PdfRendererService } from './pdf-renderer.service';
import { ExcelRendererService } from './excel-renderer.service';
export declare class ReportGeneratorService {
    private prisma;
    private templateService;
    private dataProvider;
    private pdfRenderer;
    private excelRenderer;
    constructor(prisma: PrismaService, templateService: TemplateService, dataProvider: DataProviderService, pdfRenderer: PdfRendererService, excelRenderer: ExcelRendererService);
    generate(dto: GenerateReportDto, userId: string): Promise<{
        success: boolean;
        logId: number;
        fileUrl: string;
        fileSize: number;
        generatedAt: Date;
    }>;
    generatePreview(templateId: number, format: 'PDF' | 'EXCEL'): Promise<{
        success: boolean;
        logId: number;
        fileUrl: string;
        fileSize: number;
        generatedAt: Date;
        message: string;
    }>;
    getGenerationLogs(limit?: number, offset?: number): Promise<{
        logs: ({
            template: {
                name: string;
                code: string;
            };
        } & {
            id: number;
            status: string;
            format: string;
            recordId: string | null;
            parameters: string | null;
            templateId: number;
            errorMessage: string | null;
            filePath: string | null;
            fileSize: number | null;
            generatedBy: string | null;
            generatedAt: Date;
        })[];
        total: number;
        limit: number;
        offset: number;
    }>;
    getGenerationLog(id: number): Promise<{
        template: {
            name: string;
            code: string;
            productModule: string;
        };
    } & {
        id: number;
        status: string;
        format: string;
        recordId: string | null;
        parameters: string | null;
        templateId: number;
        errorMessage: string | null;
        filePath: string | null;
        fileSize: number | null;
        generatedBy: string | null;
        generatedAt: Date;
    }>;
    printPassbook(options: {
        accountNumber: string;
        productType: string;
        startLine?: number;
        mode: 'NEW_ONLY' | 'ALL' | 'RANGE';
        rangeStart?: number;
        rangeEnd?: number;
    }): Promise<{
        success: boolean;
        logId: number;
        fileUrl: string;
        fileSize: number;
        generatedAt: Date;
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
    private getNewTransactions;
    private getAllTransactions;
    private getTransactionRange;
    private generateDummyData;
}
