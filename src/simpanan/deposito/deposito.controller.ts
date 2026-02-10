import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DepositoService } from './deposito.service';
import { CreateDepositoDto } from './dto/create-deposito.dto';
import { SimpananInterestService } from '../simpanan-interest.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('api/simpanan/deposito')
@UseGuards(JwtAuthGuard)
export class DepositoController {
  constructor(
    private readonly depositoService: DepositoService,
    private readonly interestService: SimpananInterestService,
  ) {}

  @Post('test-interest')
  async testInterest() {
    // Trigger Daily Scheduler Manually
    // This process checks:
    // 1. Deposito (Is it Anniversary?)
    // 2. Savings (Is it 1st of Month? - We might need to force it for Testing)

    // For testing purposes, we might want to FORCE the "1st of Month" logic.
    // But handleDailyScheduler uses internal date checks.
    // Let's create a special public method in Service or just bypass?
    // User asked to "tes fungsi semua bunga".
    // Let's call the public scheduler.
    // NOTE: If today is NOT 1st, it won't run savings.
    // We should add a 'force' param to handleDailyScheduler?
    // Let's modify the service first. But for now, let's just call it.
    // Actually, better to add a separate force method in Service.
    await this.interestService.forceRunAllInterest();
    return {
      message: 'Interest Scheduler Triggered for ALL Products (Forced)',
    };
  }

  @Get(':noJangka/simulation')
  async getSimulation(@Param('noJangka') noJangka: string) {
    return this.interestService.simulateProcessing(noJangka);
  }

  @Get()
  findAll() {
    return this.depositoService.findAll();
  }

  @Get(':noJangka')
  findOne(@Param('noJangka') noJangka: string) {
    return this.depositoService.findOne(noJangka);
  }

  @Post()
  create(@Body() createDto: CreateDepositoDto, @Req() req: any) {
    // Mock user ID if request user is missing (dev mode hack)
    const userId = req.user?.id || 1;
    return this.depositoService.create(createDto, userId);
  }

  @Post(':noJangka/cair')
  withdraw(
    @Param('noJangka') noJangka: string,
    @Body() body: { penalty?: number; adminFee?: number; reason?: string },
    @Req() req: any,
  ) {
    const userId = req.user?.id || 1;
    return this.depositoService.withdraw(noJangka, userId, body);
  }
}
