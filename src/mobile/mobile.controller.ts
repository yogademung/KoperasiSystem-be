import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { MobileService } from './mobile.service';
import { MobileJwtAuthGuard } from '../mobile-auth/guards/mobile-jwt-auth.guard';

@UseGuards(MobileJwtAuthGuard)
@Controller('api/mobile')
export class MobileController {
  constructor(private readonly mobileService: MobileService) {}

  @Get('me')
  getProfile(@Request() req) {
    return this.mobileService.getProfileAndBalance(req.user.nasabahId);
  }

  @Get('withdrawals')
  getWithdrawals(@Request() req) {
    return this.mobileService.getWithdrawals(req.user.nasabahId);
  }

  @Post('withdrawals')
  createWithdrawal(@Request() req, @Body() body: any) {
    return this.mobileService.createWithdrawal(req.user.nasabahId, body);
  }

  @Get('withdrawals/:id')
  getWithdrawal(@Request() req, @Param('id') id: string) {
    return this.mobileService.getWithdrawal(req.user.nasabahId, +id);
  }

  @Get('transactions')
  getTransactions(@Request() req) {
    return this.mobileService.getTransactions(req.user.nasabahId);
  }
}
