import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { PosShiftService } from './pos-shift.service';

@Controller('pos/shifts')
export class PosShiftController {
  constructor(private readonly posShiftService: PosShiftService) {}

  @Post('open')
  openShift(@Body() data: { userId: number; startingCash: number }) {
    return this.posShiftService.openShift(data.userId, data.startingCash);
  }

  @Post(':id/close')
  closeShift(@Param('id') id: string, @Body() data: { endingCash: number }) {
    return this.posShiftService.closeShift(+id, data.endingCash);
  }

  @Get('active')
  getActiveShift(@Query('userId') userId: string) {
    return this.posShiftService.getActiveShift(+userId);
  }
}
