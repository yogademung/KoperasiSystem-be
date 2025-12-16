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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const template_service_1 = require("./template.service");
const report_metadata_service_1 = require("./report-metadata.service");
const report_generator_service_1 = require("./report-generator.service");
const report_dto_1 = require("./dto/report.dto");
let ReportController = class ReportController {
    templateService;
    metadataService;
    generatorService;
    constructor(templateService, metadataService, generatorService) {
        this.templateService = templateService;
        this.metadataService = metadataService;
        this.generatorService = generatorService;
    }
    async getMetadata(productModule) {
        return this.metadataService.getMetadata(productModule);
    }
    async getAllProductModules() {
        return this.metadataService.getAllProductModules();
    }
    async listTemplates(productModule, category, isDefault) {
        const filters = {
            productModule,
            category,
            isDefault: isDefault === 'true' ? true : isDefault === 'false' ? false : undefined,
        };
        const templates = await this.templateService.findAll(filters);
        return {
            templates,
            total: templates.length,
        };
    }
    async getTemplate(id) {
        return this.templateService.findOne(id);
    }
    async getTemplateByCode(code) {
        return this.templateService.findByCode(code);
    }
    async createTemplate(dto, req) {
        const userId = req.user?.username || 'system';
        return this.templateService.create(dto, userId);
    }
    async updateTemplate(id, dto, req) {
        const userId = req.user?.username || 'system';
        return this.templateService.update(id, dto, userId);
    }
    async deleteTemplate(id, req) {
        const userId = req.user?.username || 'system';
        return this.templateService.delete(id, userId);
    }
    async createTemplateVersion(id, name, req) {
        const userId = req.user?.username || 'system';
        return this.templateService.createVersion(id, name, userId);
    }
    async generateReport(dto, req) {
        const userId = req.user?.username || 'system';
        return this.generatorService.generate(dto, userId);
    }
    async previewTemplate(templateId, format = 'PDF') {
        return this.generatorService.generatePreview(templateId, format);
    }
    async getGenerationLogs(limit = '50', offset = '0') {
        return this.generatorService.getGenerationLogs(parseInt(limit), parseInt(offset));
    }
    async getGenerationLog(id) {
        return this.generatorService.getGenerationLog(id);
    }
};
exports.ReportController = ReportController;
__decorate([
    (0, common_1.Get)('metadata/:productModule'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available variables for a product module' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns variable metadata' }),
    __param(0, (0, common_1.Param)('productModule')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getMetadata", null);
__decorate([
    (0, common_1.Get)('metadata'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all product modules' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getAllProductModules", null);
__decorate([
    (0, common_1.Get)('templates'),
    (0, swagger_1.ApiOperation)({ summary: 'List all templates' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns list of templates' }),
    __param(0, (0, common_1.Query)('productModule')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('isDefault')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "listTemplates", null);
__decorate([
    (0, common_1.Get)('templates/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get template details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns template details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Template not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getTemplate", null);
__decorate([
    (0, common_1.Get)('templates/code/:code'),
    (0, swagger_1.ApiOperation)({ summary: 'Get template by code' }),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getTemplateByCode", null);
__decorate([
    (0, common_1.Post)('templates'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new template' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Template created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid template data' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_dto_1.CreateTemplateDto, Object]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "createTemplate", null);
__decorate([
    (0, common_1.Put)('templates/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update template' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Template updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Template not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, report_dto_1.UpdateTemplateDto, Object]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "updateTemplate", null);
__decorate([
    (0, common_1.Delete)('templates/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete template (soft delete)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Template deleted successfully' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "deleteTemplate", null);
__decorate([
    (0, common_1.Post)('templates/:id/version'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new version of template' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('name')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "createTemplateVersion", null);
__decorate([
    (0, common_1.Post)('generate'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate report from template' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Report generated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Template not found' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_dto_1.GenerateReportDto, Object]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "generateReport", null);
__decorate([
    (0, common_1.Get)('preview/:templateId'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate preview with dummy data' }),
    __param(0, (0, common_1.Param)('templateId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "previewTemplate", null);
__decorate([
    (0, common_1.Get)('logs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get report generation logs' }),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getGenerationLogs", null);
__decorate([
    (0, common_1.Get)('logs/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get specific generation log' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getGenerationLog", null);
exports.ReportController = ReportController = __decorate([
    (0, swagger_1.ApiTags)('reports'),
    (0, common_1.Controller)('reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [template_service_1.TemplateService,
        report_metadata_service_1.ReportMetadataService,
        report_generator_service_1.ReportGeneratorService])
], ReportController);
//# sourceMappingURL=report.controller.js.map