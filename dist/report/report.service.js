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
exports.ReportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const template_service_1 = require("./template.service");
const report_metadata_service_1 = require("./report-metadata.service");
const report_generator_service_1 = require("./report-generator.service");
let ReportService = class ReportService {
    prisma;
    templateService;
    metadataService;
    generatorService;
    constructor(prisma, templateService, metadataService, generatorService) {
        this.prisma = prisma;
        this.templateService = templateService;
        this.metadataService = metadataService;
        this.generatorService = generatorService;
    }
    async getReportInfo(templateCode) {
        const template = await this.templateService.findByCode(templateCode);
        const metadata = await this.metadataService.getMetadata(template.productModule);
        return {
            template,
            metadata,
        };
    }
    async generateReportByCode(templateCode, format, parameters, userId) {
        const template = await this.templateService.findByCode(templateCode);
        return this.generatorService.generate({
            templateId: template.id,
            format,
            parameters,
        }, userId);
    }
    async getTemplatesByProduct(productModule) {
        return this.templateService.findAll({ productModule });
    }
    async getDefaultTemplates() {
        return this.templateService.findAll({ isDefault: true });
    }
};
exports.ReportService = ReportService;
exports.ReportService = ReportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        template_service_1.TemplateService,
        report_metadata_service_1.ReportMetadataService,
        report_generator_service_1.ReportGeneratorService])
], ReportService);
//# sourceMappingURL=report.service.js.map