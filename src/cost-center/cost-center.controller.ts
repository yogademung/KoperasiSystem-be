import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { CostCenterService, CreateCostCenterDto, UpdateCostCenterDto, CostCenterFilters } from './cost-center.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/cost-centers')
@UseGuards(JwtAuthGuard)
export class CostCenterController {
    constructor(private readonly costCenterService: CostCenterService) { }

    @Post()
    async create(
        @Body() dto: CreateCostCenterDto,
        // TODO: Get from authenticated user
    ) {
        const userId = 1; // Temporary
        return this.costCenterService.create(dto, userId);
    }

    @Get()
    async findAll(@Query() filters: CostCenterFilters) {
        return this.costCenterService.findAll(filters);
    }

    @Get('tree')
    async getTree(@Query('rootId', ParseIntPipe) rootId?: number) {
        return this.costCenterService.getTree(rootId);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.costCenterService.findOne(id);
    }

    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateCostCenterDto,
    ) {
        return this.costCenterService.update(id, dto);
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        return this.costCenterService.delete(id);
    }

    @Get(':id/children')
    async getChildren(@Param('id', ParseIntPipe) id: number) {
        return this.costCenterService.getChildren(id);
    }

    @Get(':id/budget-status')
    async getBudgetStatus(
        @Param('id', ParseIntPipe) id: number,
        @Query('year', ParseIntPipe) year: number,
        @Query('month', ParseIntPipe) month?: number,
    ) {
        return this.costCenterService.getBudgetStatus(id, year, month);
    }
}
