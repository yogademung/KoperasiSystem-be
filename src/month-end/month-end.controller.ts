import { Controller, Get, Post, Body, Param, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { PeriodLockService } from './period-lock.service';
import { DepreciationService } from './depreciation.service';
import { BalanceSheetService } from './balance-sheet.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { LovValueService } from './lov-value.service';

@Controller('month-end')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MonthEndController {
    constructor(
        private readonly periodLockService: PeriodLockService,
        private readonly depreciationService: DepreciationService,
        private readonly balanceSheetService: BalanceSheetService,
        private readonly lovValueService: LovValueService
    ) { }

    @Get('lock/:period')
    async checkLockStatus(@Param('period') period: string) {
        const isLocked = await this.periodLockService.isPeriodLocked(period);
        return { period, isLocked };
    }

    @Post('close')
    // @UseGuards(JwtAuthGuard)
    async closePeriod(@Body() body: { period: string }, @Req() req) {
        // const userId = req.user.id;
        const userId = 1; // Temporary mock until Auth confirmed
        return this.periodLockService.closePeriod(body.period, userId);
    }

    @Post('unlock-request')
    async requestUnlock(@Body() body: { period: string; reason: string }, @Req() req) {
        const userId = 1;
        return this.periodLockService.requestUnlock(body.period, userId, body.reason);
    }

    @Post('approve-unlock')
    // @Roles('MANAGER')
    async approveUnlock(@Body() body: { requestId: number; notes: string }, @Req() req) {
        const managerId = 1;
        return this.periodLockService.approveUnlock(body.requestId, managerId, body.notes);
    }

    @Post('admin/force-unlock')
    // @Roles('ADMIN')
    async adminForceUnlock(@Body() body: { period: string; reason: string }, @Req() req) {
        const adminId = 1;
        return this.periodLockService.adminForceUnlock(body.period, adminId, body.reason);
    }

    @Get('depreciation/preview/:period')
    async previewDepreciation(@Param('period') period: string) {
        return this.depreciationService.calculateMonthlyDepreciation(period);
    }

    @Post('depreciation/post')
    async postDepreciation(@Body() body: { period: string }, @Req() req) {
        const userId = 1;
        return this.depreciationService.postMonthlyDepreciation(body.period, userId);
    }

    @Get('validate-balance/:period')
    async validateBalance(@Param('period') period: string) {
        return this.balanceSheetService.validateBalance(period);
    }

    @Get('last-closed-period')
    async getLastClosedPeriod() {
        const period = await this.lovValueService.getLastClosingMonth();
        return { period };
    }
}
