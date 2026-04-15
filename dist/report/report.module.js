"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportModule = void 0;
const common_1 = require("@nestjs/common");
const report_controller_1 = require("./report.controller");
const report_service_1 = require("./report.service");
const report_metadata_service_1 = require("./report-metadata.service");
const report_generator_service_1 = require("./report-generator.service");
const template_service_1 = require("./template.service");
const data_provider_service_1 = require("./data-provider.service");
const pdf_renderer_service_1 = require("./pdf-renderer.service");
const excel_renderer_service_1 = require("./excel-renderer.service");
const prisma_module_1 = require("../database/prisma.module");
let ReportModule = class ReportModule {
};
exports.ReportModule = ReportModule;
exports.ReportModule = ReportModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [report_controller_1.ReportController],
        providers: [
            report_service_1.ReportService,
            report_metadata_service_1.ReportMetadataService,
            report_generator_service_1.ReportGeneratorService,
            template_service_1.TemplateService,
            data_provider_service_1.DataProviderService,
            pdf_renderer_service_1.PdfRendererService,
            excel_renderer_service_1.ExcelRendererService,
        ],
        exports: [report_service_1.ReportService, report_metadata_service_1.ReportMetadataService, report_generator_service_1.ReportGeneratorService],
    })
], ReportModule);
//# sourceMappingURL=report.module.js.map