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
let ReportGeneratorService = class ReportGeneratorService {
    prisma;
    templateService;
    constructor(prisma, templateService) {
        this.prisma = prisma;
        this.templateService = templateService;
    }
    async generate(dto, userId) {
        const template = await this.templateService.findOne(dto.templateId);
        const log = await this.prisma.reportGenerationLog.create({
            data: {
                templateId: dto.templateId,
                recordId: dto.recordId,
                format: dto.format,
                parameters: dto.parameters,
                status: 'SUCCESS',
                filePath: `/downloads/reports/${template.code}_${Date.now()}.${dto.format.toLowerCase()}`,
                fileSize: 0,
                generatedBy: userId,
            },
        });
        return {
            success: true,
            logId: log.id,
            fileUrl: log.filePath,
            fileSize: log.fileSize || 0,
            generatedAt: log.generatedAt,
            message: 'Report generation engine will be implemented in Phase 2',
        };
    }
    async generatePreview(templateId, format) {
        const template = await this.templateService.findOne(templateId);
        return {
            success: true,
            message: 'Preview generation will be implemented in Phase 2',
            template: {
                id: template.id,
                code: template.code,
                name: template.name,
            },
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
        return {
            success: true,
            message: 'Passbook printing will be implemented in Phase 2',
        };
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
};
exports.ReportGeneratorService = ReportGeneratorService;
exports.ReportGeneratorService = ReportGeneratorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        template_service_1.TemplateService])
], ReportGeneratorService);
//# sourceMappingURL=report-generator.service.js.map