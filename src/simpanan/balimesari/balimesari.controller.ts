import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BalimesariService } from './balimesari.service';
import { CreateBalimesariDto } from './dto/create-balimesari.dto';
import { BalimesariTransactionDto } from './dto/transaction.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('api/simpanan/balimesari')
@UseGuards(JwtAuthGuard)
export class BalimesariController {
  constructor(private readonly balimesariService: BalimesariService) {}

  @Post()
  create(@Body() createDto: CreateBalimesariDto, @Req() req) {
    const userId = req.user?.id || 1;
    return this.balimesariService.create(createDto);
  }

  @Get()
  findAll() {
    return this.balimesariService.findAll();
  }

  @Get(':noBalimesari')
  findOne(@Param('noBalimesari') noBalimesari: string) {
    return this.balimesariService.findOne(noBalimesari);
  }

  @Post(':noBalimesari/setoran')
  setoran(
    @Param('noBalimesari') noBalimesari: string,
    @Body() dto: BalimesariTransactionDto,
    @Req() req,
  ) {
    const userId = req.user?.id || 1;
    return this.balimesariService.setoran(noBalimesari, dto, userId);
  }

  @Post(':noBalimesari/penarikan')
  penarikan(
    @Param('noBalimesari') noBalimesari: string,
    @Body() dto: BalimesariTransactionDto,
    @Req() req,
  ) {
    const userId = req.user?.id || 1;
    return this.balimesariService.penarikan(noBalimesari, dto, userId);
  }

  @Get(':noBalimesari/transactions')
  getTransactions(
    @Param('noBalimesari') noBalimesari: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.balimesariService.getTransactions(
      noBalimesari,
      parseInt(page),
      parseInt(limit),
    );
  }
  @Post(':noBalimesari/tutup')
  close(
    @Param('noBalimesari') noBalimesari: string,
    @Body() body: { reason: string; penalty?: number; adminFee?: number },
    @Req() req,
  ) {
    const userId = req.user?.id || 1;
    return this.balimesariService.closeAccount(noBalimesari, body, userId);
  }
}
