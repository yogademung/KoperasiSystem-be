import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query, Req, BadRequestException } from '@nestjs/common';
import { AllocationService } from './allocation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/allocations')
@UseGuards(JwtAuthGuard)
export class AllocationController {
    constructor(private readonly allocationService: AllocationService) { }

    @Get('rules')
    async findAllRules() {
        return this.allocationService.findAllRules();
    }

    @Post('rules')
    async createRule(@Body() data: any, @Req() req: any) {
        return this.allocationService.createRule(data, req.user.id);
    }

    @Get('rules/:id')
    async findOneRule(@Param('id') id: string) {
        return this.allocationService.findOneRule(+id);
    }

    @Delete('rules/:id')
    async deleteRule(@Param('id') id: string) {
        return this.allocationService.deleteRule(+id);
    }

    @Post('preview')
    async preview(@Body() body: { ruleId: number, year: number, month: number }) {
        if (!body.ruleId || !body.year || !body.month) throw new BadRequestException('Missing required fields');
        return this.allocationService.previewAllocation(body.ruleId, body.year, body.month);
    }

    @Post('execute')
    async execute(@Body() body: { ruleId: number, year: number, month: number }, @Req() req: any) {
        if (!body.ruleId || !body.year || !body.month) throw new BadRequestException('Missing required fields');
        return this.allocationService.executeAllocation(body.ruleId, body.year, body.month, req.user.id);
    }

    @Get('executions')
    async getExecutions(@Query('year') year?: string, @Query('month') month?: string) {
        return this.allocationService.getExecutions(year ? +year : undefined, month ? +month : undefined);
    }

    @Post('rollback/:id')
    async rollback(@Param('id') id: string, @Req() req: any) {
        return this.allocationService.rollbackExecution(+id, req.user.id);
    }
}
