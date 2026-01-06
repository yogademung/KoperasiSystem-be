import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { StartShiftDto, EndShiftDto } from './dto/collector-shift.dto';
import { CollectorService } from './collector.service';
// import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'; // Assuming standard guard exists

@Controller('api/collector')
// @UseGuards(JwtAuthGuard) 
export class CollectorController {
    constructor(private readonly collectorService: CollectorService) { }

    @Get('stats')
    async getStats(@Req() req) {
        // Mock user if auth not active or req.user unavailable in dev
        const userId = req.user?.id || 1;
        return this.collectorService.getDailyStats(userId);
    }

    @Get('transactions')
    async getTransactions(@Req() req) {
        const userId = req.user?.id || 1;
        return this.collectorService.getDailyTransactions(userId);
    }
    @Get('shift/active')
    async getActiveShift(@Req() req) {
        const userId = req.user?.id || 1;
        return this.collectorService.getActiveShift(userId);
    }

    @Post('shift/start')
    async startShift(@Req() req, @Body() dto: StartShiftDto) {
        const userId = req.user?.id || 1;
        return this.collectorService.startShift(userId, dto);
    }

    @Post('shift/end')
    async endShift(@Req() req, @Body() dto: EndShiftDto) {
        const userId = req.user?.id || 1;
        return this.collectorService.endShift(userId, dto);
    }
}
