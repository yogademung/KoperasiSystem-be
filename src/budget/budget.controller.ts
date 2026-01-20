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
    Req,
    ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
    BudgetService,
    CreateBudgetPeriodDto,
    UpdateBudgetPeriodDto,
    CreateBudgetDto,
    UpdateBudgetDto,
    BudgetFilters,
    PeriodFilters,
} from './budget.service';
import { BudgetPeriodStatus } from '@prisma/client';

@Controller('api/budget')
@UseGuards(JwtAuthGuard)
export class BudgetController {
    constructor(private readonly budgetService: BudgetService) { }

    // ============================================
    // Budget Period Endpoints
    // ============================================

    @Post('periods')
    async createPeriod(@Body() dto: CreateBudgetPeriodDto, @Req() req: any) {
        return this.budgetService.createPeriod(dto, req.user.userId);
    }

    @Get('periods')
    async findAllPeriods(@Query() query: any) {
        const filters: PeriodFilters = {
            year: query.year ? parseInt(query.year) : undefined,
            status: query.status as BudgetPeriodStatus,
        };
        return this.budgetService.findAllPeriods(filters);
    }

    @Get('periods/:id')
    async findOnePeriod(@Param('id', ParseIntPipe) id: number) {
        return this.budgetService.findOnePeriod(id);
    }

    @Put('periods/:id')
    async updatePeriod(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateBudgetPeriodDto,
    ) {
        return this.budgetService.updatePeriod(id, dto);
    }

    @Post('periods/:id/approve')
    async approvePeriod(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: any,
    ) {
        return this.budgetService.approvePeriod(id, req.user.userId);
    }

    @Post('periods/:id/close')
    async closePeriod(@Param('id', ParseIntPipe) id: number) {
        return this.budgetService.closePeriod(id);
    }

    // ============================================
    // Budget Entry Endpoints
    // ============================================

    @Post('entries')
    async createBudget(@Body() dto: CreateBudgetDto, @Req() req: any) {
        return this.budgetService.createBudget(dto, req.user.userId);
    }

    @Get('entries')
    async findAllBudgets(@Query() query: any) {
        const filters: BudgetFilters = {
            periodId: query.periodId ? parseInt(query.periodId) : undefined,
            costCenterId: query.costCenterId ? parseInt(query.costCenterId) : undefined,
            businessUnitId: query.businessUnitId ? parseInt(query.businessUnitId) : undefined,
            accountCode: query.accountCode,
            search: query.search,
        };
        return this.budgetService.findAllBudgets(filters);
    }

    @Get('entries/:id')
    async findOneBudget(@Param('id', ParseIntPipe) id: number) {
        return this.budgetService.findOneBudget(id);
    }

    @Put('entries/:id')
    async updateBudget(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateBudgetDto,
    ) {
        return this.budgetService.updateBudget(id, dto);
    }

    @Delete('entries/:id')
    async deleteBudget(@Param('id', ParseIntPipe) id: number) {
        return this.budgetService.deleteBudget(id);
    }

    @Post('entries/copy')
    async copyBudgets(
        @Body() body: {
            sourcePeriodId: number;
            targetPeriodId: number;
            adjustmentPercent?: number;
        },
        @Req() req: any,
    ) {
        return this.budgetService.copyFromPreviousPeriod(
            body.sourcePeriodId,
            body.targetPeriodId,
            req.user.userId,
            body.adjustmentPercent || 0,
        );
    }

    // ============================================
    // Reports & Analysis Endpoints
    // ============================================

    @Get('variance/:periodId')
    async getVarianceReport(
        @Param('periodId', ParseIntPipe) periodId: number,
        @Query('costCenterId') costCenterId?: string,
        @Query('businessUnitId') businessUnitId?: string,
    ) {
        return this.budgetService.getVarianceReport(
            periodId,
            costCenterId ? parseInt(costCenterId) : undefined,
            businessUnitId ? parseInt(businessUnitId) : undefined,
        );
    }

    @Get('utilization/:costCenterId/:periodId')
    async getBudgetUtilization(
        @Param('costCenterId', ParseIntPipe) costCenterId: number,
        @Param('periodId', ParseIntPipe) periodId: number,
    ) {
        return this.budgetService.getBudgetUtilization(costCenterId, periodId);
    }
}
