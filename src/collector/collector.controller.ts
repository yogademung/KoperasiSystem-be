import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { CollectorService } from './collector.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { StartShiftDto, EndShiftDto } from './dto/collector-shift.dto';
import { Post, Body } from '@nestjs/common';

@Controller('api/collector')
@UseGuards(JwtAuthGuard)
export class CollectorController {
  constructor(private readonly collectorService: CollectorService) {}

  @Get('stats')
  async getStats(@Req() req) {
    const userId = req.user.id;
    // Get active shift to filter stats by shift start time
    const activeShift = await this.collectorService.getActiveShift(userId);
    const shiftStartTime = activeShift?.startTime;

    return this.collectorService.getDailyStats(userId, shiftStartTime);
  }

  @Get('shift/active')
  async getActiveShift(@Req() req) {
    const userId = req.user.id;
    return this.collectorService.getActiveShift(userId);
  }

  @Post('shift/start')
  async startShift(@Req() req, @Body() dto: StartShiftDto) {
    const userId = req.user.id;
    return this.collectorService.startShift(userId, dto);
  }

  @Post('shift/end')
  async endShift(@Req() req, @Body() dto: EndShiftDto) {
    const userId = req.user.id;
    return this.collectorService.endShift(userId, dto);
  }

  @Get('flash-summary')
  async getFlashSummary() {
    return this.collectorService.getFlashSummary();
  }
}
