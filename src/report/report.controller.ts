import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TemplateService } from './template.service';
import { ReportMetadataService } from './report-metadata.service';
import { ReportGeneratorService } from './report-generator.service';
import { CreateTemplateDto, UpdateTemplateDto, GenerateReportDto } from './dto/report.dto';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportController {
    constructor(
        private templateService: TemplateService,
        private metadataService: ReportMetadataService,
        private generatorService: ReportGeneratorService,
    ) { }

    // ============================================
    // Metadata Endpoints
    // ============================================

    @Get('metadata/:productModule')
    @ApiOperation({ summary: 'Get available variables for a product module' })
    @ApiResponse({ status: 200, description: 'Returns variable metadata' })
    async getMetadata(@Param('productModule') productModule: string) {
        return this.metadataService.getMetadata(productModule);
    }

    @Get('metadata')
    @ApiOperation({ summary: 'Get all product modules' })
    async getAllProductModules() {
        return this.metadataService.getAllProductModules();
    }

    // ============================================
    // Template Management Endpoints
    // ============================================

    @Get('templates')
    @ApiOperation({ summary: 'List all templates' })
    @ApiResponse({ status: 200, description: 'Returns list of templates' })
    async listTemplates(
        @Query('productModule') productModule?: string,
        @Query('category') category?: string,
        @Query('isDefault') isDefault?: string,
    ) {
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

    @Get('templates/:id')
    @ApiOperation({ summary: 'Get template details' })
    @ApiResponse({ status: 200, description: 'Returns template details' })
    @ApiResponse({ status: 404, description: 'Template not found' })
    async getTemplate(@Param('id', ParseIntPipe) id: number) {
        return this.templateService.findOne(id);
    }

    @Get('templates/code/:code')
    @ApiOperation({ summary: 'Get template by code' })
    async getTemplateByCode(@Param('code') code: string) {
        return this.templateService.findByCode(code);
    }

    @Post('templates')
    @ApiOperation({ summary: 'Create new template' })
    @ApiResponse({ status: 201, description: 'Template created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid template data' })
    async createTemplate(@Body() dto: CreateTemplateDto, @Request() req) {
        const userId = req.user?.username || 'system';
        return this.templateService.create(dto, userId);
    }

    @Put('templates/:id')
    @ApiOperation({ summary: 'Update template' })
    @ApiResponse({ status: 200, description: 'Template updated successfully' })
    @ApiResponse({ status: 404, description: 'Template not found' })
    async updateTemplate(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateTemplateDto,
        @Request() req,
    ) {
        const userId = req.user?.username || 'system';
        return this.templateService.update(id, dto, userId);
    }

    @Delete('templates/:id')
    @ApiOperation({ summary: 'Delete template (soft delete)' })
    @ApiResponse({ status: 200, description: 'Template deleted successfully' })
    async deleteTemplate(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const userId = req.user?.username || 'system';
        return this.templateService.delete(id, userId);
    }

    @Post('templates/:id/version')
    @ApiOperation({ summary: 'Create new version of template' })
    async createTemplateVersion(
        @Param('id', ParseIntPipe) id: number,
        @Body('name') name: string,
        @Request() req,
    ) {
        const userId = req.user?.username || 'system';
        return this.templateService.createVersion(id, name, userId);
    }

    // ============================================
    // Report Generation Endpoints
    // ============================================

    @Post('generate')
    @ApiOperation({ summary: 'Generate report from template' })
    @ApiResponse({ status: 200, description: 'Report generated successfully' })
    @ApiResponse({ status: 404, description: 'Template not found' })
    async generateReport(@Body() dto: GenerateReportDto, @Request() req) {
        const userId = req.user?.username || 'system';
        return this.generatorService.generate(dto, userId);
    }

    @Get('preview/:templateId')
    @ApiOperation({ summary: 'Generate preview with dummy data' })
    async previewTemplate(
        @Param('templateId', ParseIntPipe) templateId: number,
        @Query('format') format: 'PDF' | 'EXCEL' = 'PDF',
    ) {
        return this.generatorService.generatePreview(templateId, format);
    }

    @Get('logs')
    @ApiOperation({ summary: 'Get report generation logs' })
    async getGenerationLogs(
        @Query('limit') limit: string = '50',
        @Query('offset') offset: string = '0',
    ) {
        return this.generatorService.getGenerationLogs(
            parseInt(limit),
            parseInt(offset),
        );
    }

    @Get('logs/:id')
    @ApiOperation({ summary: 'Get specific generation log' })
    async getGenerationLog(@Param('id', ParseIntPipe) id: number) {
        return this.generatorService.getGenerationLog(id);
    }
}
