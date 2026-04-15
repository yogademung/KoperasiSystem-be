"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const template_service_1 = require("./template.service");
const data_provider_service_1 = require("./data-provider.service");
const pdf_renderer_service_1 = require("./pdf-renderer.service");
const excel_renderer_service_1 = require("./excel-renderer.service");
let ReportGeneratorService = class ReportGeneratorService {
    prisma;
    templateService;
    dataProvider;
    pdfRenderer;
    excelRenderer;
    constructor(prisma, templateService, dataProvider, pdfRenderer, excelRenderer) {
        this.prisma = prisma;
        this.templateService = templateService;
        this.dataProvider = dataProvider;
        this.pdfRenderer = pdfRenderer;
        this.excelRenderer = excelRenderer;
    }
    async generate(dto, userId) {
        try {
            const template = await this.templateService.findOne(dto.templateId);
            const templateSchema = template.jsonSchema;
            const data = await this.dataProvider.getReportData(template.productModule, dto.recordId, dto.parameters);
            const timestamp = Date.now();
            const extension = dto.format.toLowerCase();
            const filename = `${template.code}_${timestamp}.${extension}`;
            let filePath;
            if (dto.format === 'PDF') {
                filePath = await this.pdfRenderer.renderToPdf(templateSchema, data, filename);
            }
            else {
                filePath = await this.excelRenderer.renderToExcel(templateSchema, data, filename);
            }
            const fileSize = dto.format === 'PDF'
                ? await this.pdfRenderer.getFileSize(filePath)
                : await this.excelRenderer.getFileSize(filePath);
            const log = await this.prisma.reportGenerationLog.create({
                data: {
                    templateId: dto.templateId,
                    recordId: dto.recordId,
                    format: dto.format,
                    parameters: JSON.stringify(dto.parameters || {}),
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
        }
        catch (error) {
            const log = await this.prisma.reportGenerationLog.create({
                data: {
                    templateId: dto.templateId,
                    recordId: dto.recordId,
                    format: dto.format,
                    parameters: JSON.stringify(dto.parameters || {}),
                    status: 'FAILED',
                    errorMessage: error.message,
                    generatedBy: userId,
                },
            });
            throw error;
        }
    }
    async generatePreview(templateId, format) {
        const template = await this.templateService.findOne(templateId);
        const dummyData = this.generateDummyData(template.productModule);
        const result = await this.generate({
            templateId,
            format,
            parameters: dummyData,
        }, 'preview');
        return {
            message: 'Preview generated with dummy data',
            ...result,
        };
    }
    async getGenerationLogs(limit = 50, offset = 0) {
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
    async getGenerationLog(id) {
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
            throw new common_1.NotFoundException(`Generation log with ID ${id} not found`);
        }
        return log;
    }
    async printPassbook(options) {
        const state = await this.getPassbookState(options.accountNumber);
        const startLine = options.startLine ?? state?.lastPrintedLine ?? 1;
        const template = await this.templateService.findByCode(`${options.productType}_PASSBOOK`);
        let transactions = [];
        if (options.mode === 'NEW_ONLY' && state) {
            transactions = await this.getNewTransactions(options.accountNumber, options.productType, state.lastPrintedTransId);
        }
        else if (options.mode === 'ALL') {
            transactions = await this.getAllTransactions(options.accountNumber, options.productType);
        }
        else if (options.mode === 'RANGE') {
            transactions = await this.getTransactionRange(options.accountNumber, options.productType, options.rangeStart, options.rangeEnd);
        }
        const data = {
            transactions,
            startLine,
        };
        const result = await this.generate({
            templateId: template.id,
            format: 'PDF',
            recordId: options.accountNumber,
            parameters: data,
        }, 'passbook');
        if (options.mode === 'NEW_ONLY' && transactions.length > 0) {
            await this.updatePassbookState(options.accountNumber, options.productType, transactions[transactions.length - 1].id, startLine + transactions.length);
        }
        return result;
    }
    async getPassbookState(accountNumber) {
        return this.prisma.passbookPrintState.findUnique({
            where: { accountNumber },
        });
    }
    async updatePassbookState(accountNumber, productType, lastPrintedTransId, lastPrintedLine) {
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
    async getNewTransactions(accountNumber, productType, lastPrintedTransId) {
        return [];
    }
    async getAllTransactions(accountNumber, productType) {
        return [];
    }
    async getTransactionRange(accountNumber, productType, start, end) {
        return [];
    }
    generateDummyData(productModule) {
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
                        {
                            no: 1,
                            tgl: '01-01-2025',
                            kode: 'SETOR',
                            debet: '',
                            kredit: 'Rp 1.000.000',
                            saldo: 'Rp 1.000.000',
                        },
                        {
                            no: 2,
                            tgl: '02-01-2025',
                            kode: 'TARIK',
                            debet: 'Rp 500.000',
                            kredit: '',
                            saldo: 'Rp 500.000',
                        },
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
};
exports.ReportGeneratorService = ReportGeneratorService;
exports.ReportGeneratorService = ReportGeneratorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        template_service_1.TemplateService,
        data_provider_service_1.DataProviderService,
        pdf_renderer_service_1.PdfRendererService,
        excel_renderer_service_1.ExcelRendererService])
], ReportGeneratorService);
//# sourceMappingURL=report-generator.service.js.map