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
        logId: any;
        fileUrl: string;
        fileSize: any;
        generatedAt: any;
    }>;
    generatePreview(templateId: number, format: 'PDF' | 'EXCEL'): Promise<{
        success: boolean;
        logId: any;
        fileUrl: string;
        fileSize: any;
        generatedAt: any;
        message: string;
    }>;
    getGenerationLogs(limit?: number, offset?: number): Promise<{
        logs: any;
        total: any;
        limit: number;
        offset: number;
    }>;
    getGenerationLog(id: number): Promise<any>;
    printPassbook(options: {
        accountNumber: string;
        productType: string;
        startLine?: number;
        mode: 'NEW_ONLY' | 'ALL' | 'RANGE';
        rangeStart?: number;
        rangeEnd?: number;
    }): Promise<{
        success: boolean;
        logId: any;
        fileUrl: string;
        fileSize: any;
        generatedAt: any;
    }>;
    getPassbookState(accountNumber: string): Promise<any>;
    updatePassbookState(accountNumber: string, productType: string, lastPrintedTransId: number, lastPrintedLine: number): Promise<any>;
    private getNewTransactions;
    private getAllTransactions;
    private getTransactionRange;
    private generateDummyData;
}
