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
import { InterUnitService, CreateInterUnitTransactionDto, InterUnitTransactionFilters } from './inter-unit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// TODO: Implement GetUser decorator or use @Req() Request

@Controller('inter-unit')
@UseGuards(JwtAuthGuard)
export class InterUnitController {
    constructor(private readonly interUnitService: InterUnitService) { }

    @Post('transactions')
    async createTransaction(
        @Body() dto: CreateInterUnitTransactionDto,
        // TODO: Get from authenticated user
        // @GetUser('userId') userId: number,
    ) {
        const userId = 1; // Temporary hardcoded
        return this.interUnitService.create(dto, userId);
    }

    @Get('transactions')
    async getTransactions(@Query() filters: InterUnitTransactionFilters) {
        // Convert string dates to Date objects
        if (filters.startDate) {
            filters.startDate = new Date(filters.startDate);
        }
        if (filters.endDate) {
            filters.endDate = new Date(filters.endDate);
        }

        return this.interUnitService.findAll(filters);
    }

    @Get('transactions/:id')
    async getTransaction(@Param('id', ParseIntPipe) id: number) {
        return this.interUnitService.findOne(id);
    }

    @Post('transactions/:id/approve')
    async approveTransaction(
        @Param('id', ParseIntPipe) id: number,
    ) {
        const userId = 1; // TODO: Get from authenticated user
        return this.interUnitService.approve(id, userId);
    }

    @Post('transactions/:id/post')
    async postTransaction(
        @Param('id', ParseIntPipe) id: number,
    ) {
        const userId = 1; // TODO: Get from authenticated user
        return this.interUnitService.post(id, userId);
    }

    @Delete('transactions/:id')
    async deleteTransaction(@Param('id', ParseIntPipe) id: number) {
        return this.interUnitService.delete(id);
    }

    @Get('balances/:unitId')
    async getBalances(
        @Param('unitId', ParseIntPipe) unitId: number,
        @Query('asOfDate') asOfDate?: string,
    ) {
        const date = asOfDate ? new Date(asOfDate) : undefined;
        return this.interUnitService.getBalances(unitId, date);
    }

    @Post('elimination/:year/:month')
    async generateElimination(
        @Param('year', ParseIntPipe) year: number,
        @Param('month', ParseIntPipe) month: number,
    ) {
        const userId = 1; // TODO: Get from authenticated user
        return this.interUnitService.generateElimination(year, month, userId);
    }
}
