import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { GenerateReportDto } from './dto/report.dto';
import { TemplateService } from './template.service';
import { DataProviderService } from './data-provider.service';
import { PdfRendererService } from './pdf-renderer.service';
import { ExcelRendererService } from './excel-renderer.service';
import { TemplateSchema } from './interfaces/report.interfaces';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReportGeneratorService {
    constructor(
        private prisma: PrismaService,
        private templateService: TemplateService,
        private dataProvider: DataProviderService,
        private pdfRenderer: PdfRendererService,
        private excelRenderer: ExcelRendererService,
    ) { }

    async generate(dto: GenerateReportDto, userId: string) {
        try {
            // Get template
            const template = await this.templateService.findOne(dto.templateId);
            const templateSchema = template.jsonSchema as unknown as TemplateSchema;

            // Get data
            const data = await this.dataProvider.getReportData(
                template.productModule,
                dto.recordId,
                dto.parameters,
            );

            // Generate filename
            const timestamp = Date.now();
            const extension = dto.format.toLowerCase();
            const filename = `${template.code}_${timestamp}.${extension}`;

            // Generate file
            let filePath: string;
            if (dto.format === 'PDF') {
                filePath = await this.pdfRenderer.renderToPdf(templateSchema, data, filename);
            } else {
                filePath = await this.excelRenderer.renderToExcel(templateSchema, data, filename);
            }

            // Get file size
            const fileSize = dto.format === 'PDF'
                ? await this.pdfRenderer.getFileSize(filePath)
                : await this.excelRenderer.getFileSize(filePath);

            // Create log entry
            const log = await this.prisma.reportGenerationLog.create({
                data: {
                    templateId: dto.templateId,
                    recordId: dto.recordId,
                    format: dto.format,
                    parameters: (dto.parameters || {}) as Prisma.InputJsonValue,
                    status: 'SUCCESS',
                    filePath: `/uploads/reports/${filename}`,
                    fileSize,
                    generatedBy: userId,
                },
            });

            return {
                success: true,
                logId: log.id,
                fileUrl: `/uploads/reports/${filename}`,
                fileSize: log.fileSize || 0,
                generatedAt: log.generatedAt,
            };
        } catch (error) {
            // Log error
            const log = await this.prisma.reportGenerationLog.create({
                data: {
                    templateId: dto.templateId,
                    recordId: dto.recordId,
                    format: dto.format,
                    parameters: (dto.parameters || {}) as Prisma.InputJsonValue,
                    status: 'FAILED',
                    errorMessage: error.message,
                    generatedBy: userId,
                },
            });

            throw error;
        }
    }

    async generatePreview(templateId: number, format: 'PDF' | 'EXCEL') {
        const template = await this.templateService.findOne(templateId);

        // Generate dummy data
        const dummyData = this.generateDummyData(template.productModule);

        // Generate report with dummy data
        const result = await this.generate(
            {
                templateId,
                format,
                parameters: dummyData,
            },
            'preview',
        );

        return {
            message: 'Preview generated with dummy data',
            ...result,
        };
    }

    async getGenerationLogs(limit: number = 50, offset: number = 0) {
        const [logs, total] = await Promise.all([
            this.prisma.reportGenerationLog.findMany({
                take: limit,
                skip: offset,
                include: {
                    template: {
                        select: {
                            code: true,
                            name: true,
                        },
                    },
                },
                orderBy: {
                    generatedAt: 'desc',
                },
            }),
            this.prisma.reportGenerationLog.count(),
        ]);

        return {
            logs,
            total,
            limit,
            offset,
        };
    }

    async getGenerationLog(id: number) {
        const log = await this.prisma.reportGenerationLog.findUnique({
            where: { id },
            include: {
                template: {
                    select: {
                        code: true,
                        name: true,
                        productModule: true,
                    },
                },
            },
        });

        if (!log) {
            throw new NotFoundException(`Generation log with ID ${id} not found`);
        }

        return log;
    }

    // Passbook printing methods
    async printPassbook(options: {
        accountNumber: string;
        productType: string;
        startLine?: number;
        mode: 'NEW_ONLY' | 'ALL' | 'RANGE';
        rangeStart?: number;
        rangeEnd?: number;
    }) {
        // Get passbook print state
        const state = await this.getPassbookState(options.accountNumber);

        // Determine starting line
        const startLine = options.startLine ?? (state?.lastPrintedLine ?? 1);

        // Get template for passbook
        const template = await this.templateService.findByCode(`${options.productType}_PASSBOOK`);

        // Get transactions based on mode
        let transactions: any[] = [];
        if (options.mode === 'NEW_ONLY' && state) {
            transactions = await this.getNewTransactions(
                options.accountNumber,
                options.productType,
                state.lastPrintedTransId,
            );
        } else if (options.mode === 'ALL') {
            transactions = await this.getAllTransactions(options.accountNumber, options.productType);
        } else if (options.mode === 'RANGE') {
            transactions = await this.getTransactionRange(
                options.accountNumber,
                options.productType,
                options.rangeStart!,
                options.rangeEnd!,
            );
        }

        // Generate passbook PDF
        const data = {
            transactions,
            startLine,
        };

        const result = await this.generate(
            {
                templateId: template.id,
                format: 'PDF',
                recordId: options.accountNumber,
                parameters: data,
            },
            'passbook',
        );

        // Update passbook state
        if (options.mode === 'NEW_ONLY' && transactions.length > 0) {
            await this.updatePassbookState(
                options.accountNumber,
                options.productType,
                transactions[transactions.length - 1].id,
                startLine + transactions.length,
            );
        }

        return result;
    }

    async getPassbookState(accountNumber: string) {
        return this.prisma.passbookPrintState.findUnique({
            where: { accountNumber },
        });
    }

    async updatePassbookState(
        accountNumber: string,
        productType: string,
        lastPrintedTransId: number,
        lastPrintedLine: number,
    ) {
        return this.prisma.passbookPrintState.upsert({
            where: { accountNumber },
            update: {
                lastPrintedTransId,
                lastPrintedLine,
                totalLinesPrinted: {
                    increment: 1,
                },
            },
            create: {
                accountNumber,
                productType,
                lastPrintedTransId,
                lastPrintedLine,
                totalLinesPrinted: 1,
            },
        });
    }

    // Helper methods for passbook printing
    private async getNewTransactions(
        accountNumber: string,
        productType: string,
        lastPrintedTransId: number | null,
    ): Promise<any[]> {
        // Simplified - would need to query specific product transaction table
        return [];
    }

    private async getAllTransactions(accountNumber: string, productType: string): Promise<any[]> {
        // Simplified - would need to query specific product transaction table
        return [];
    }

    private async getTransactionRange(
        accountNumber: string,
        productType: string,
        start: number,
        end: number,
    ): Promise<any[]> {
        // Simplified - would need to query specific product transaction table
        return [];
    }

    // Generate dummy data for preview
    private generateDummyData(productModule: string): Record<string, any> {
        const baseData = {
            nama_instansi: 'Koperasi Krama Bali',
            alamat: 'Jl. Raya Denpasar No. 123',
            tanggal: new Date().toLocaleDateString('id-ID'),
            kabupaten: 'DENPASAR',
        };

        switch (productModule.toUpperCase()) {
            case 'SIMPANAN':
                return {
                    ...baseData,
                    no_rek: 'TAB001',
                    nama: 'I Made Dummy',
                    saldo: 'Rp 5.000.000',
                    transactions: [
                        { no: 1, tgl: '01-01-2025', kode: 'SETOR', debet: '', kredit: 'Rp 1.000.000', saldo: 'Rp 1.000.000' },
                        { no: 2, tgl: '02-01-2025', kode: 'TARIK', debet: 'Rp 500.000', kredit: '', saldo: 'Rp 500.000' },
                    ],
                };
            case 'KREDIT':
                return {
                    ...baseData,
                    no_permohonan: 'KRD001',
                    nama: 'I Ketut Dummy',
                    mohon_kredit: 'Rp 10.000.000',
                    terbilang: 'Sepuluh Juta Rupiah',
                };
            default:
                return baseData;
        }
    }
}
