import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { InventoryClosingService } from './inventory-closing.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('inventory/closing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryClosingController {
  constructor(private readonly closingService: InventoryClosingService) {}

  @Get('history')
  async getHistory(
    @Query('period') period?: string,
    @Query('warehouseId') warehouseId?: string,
  ) {
    return this.closingService.getClosingHistory(
      period,
      warehouseId ? parseInt(warehouseId) : undefined,
    );
  }

  @Post('run')
  @Roles('ADMIN', 'WAREHOUSE_MANAGER')
  async runClosing(
    @Body('period') period: string,
    @CurrentUser() user: any,
  ) {
    return this.closingService.runClosing(period, user.username);
  }
}
