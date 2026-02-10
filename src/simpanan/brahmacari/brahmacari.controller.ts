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
import { BrahmacariService } from './brahmacari.service';
import { CreateBrahmacariDto } from './dto/create-brahmacari.dto';
import { BrahmacariTransactionDto } from './dto/transaction.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('api/simpanan/brahmacari')
@UseGuards(JwtAuthGuard)
export class BrahmacariController {
  constructor(private readonly brahmacariService: BrahmacariService) {}

  @Post()
  create(@Body() createDto: CreateBrahmacariDto, @Req() req) {
    const userId = req.user?.id || 1;
    return this.brahmacariService.create(createDto);
  }

  @Get()
  findAll() {
    return this.brahmacariService.findAll();
  }

  @Get(':noBrahmacari')
  findOne(@Param('noBrahmacari') noBrahmacari: string) {
    return this.brahmacariService.findOne(noBrahmacari);
  }

  @Post(':noBrahmacari/setoran')
  setoran(
    @Param('noBrahmacari') noBrahmacari: string,
    @Body() dto: BrahmacariTransactionDto,
    @Req() req,
  ) {
    const userId = req.user?.id || 1;
    return this.brahmacariService.setoran(noBrahmacari, dto, userId);
  }

  @Post(':noBrahmacari/penarikan')
  penarikan(
    @Param('noBrahmacari') noBrahmacari: string,
    @Body() dto: BrahmacariTransactionDto,
    @Req() req,
  ) {
    const userId = req.user?.id || 1;
    return this.brahmacariService.penarikan(noBrahmacari, dto, userId);
  }

  @Get(':noBrahmacari/transactions')
  getTransactions(
    @Param('noBrahmacari') noBrahmacari: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.brahmacariService.getTransactions(
      noBrahmacari,
      parseInt(page),
      parseInt(limit),
    );
  }
  @Post(':noBrahmacari/tutup')
  close(
    @Param('noBrahmacari') noBrahmacari: string,
    @Body() body: { reason: string; penalty?: number; adminFee?: number },
    @Req() req,
  ) {
    const userId = req.user?.id || 1;
    return this.brahmacariService.closeAccount(noBrahmacari, body, userId);
  }
}
