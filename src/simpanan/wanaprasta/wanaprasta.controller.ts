import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { WanaprastaService } from './wanaprasta.service';
import { CreateWanaprastaDto } from './dto/create-wanaprasta.dto';
import { WanaprastaTransactionDto } from './dto/transaction.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('api/simpanan/wanaprasta')
@UseGuards(JwtAuthGuard)
export class WanaprastaController {
    constructor(private readonly wanaprastaService: WanaprastaService) { }

    @Post()
    create(@Body() createDto: CreateWanaprastaDto, @Req() req) {
        const userId = req.user?.id || 1;
        return this.wanaprastaService.create(createDto);
    }

    @Get()
    findAll() {
        return this.wanaprastaService.findAll();
    }

    @Get(':noWanaprasta')
    findOne(@Param('noWanaprasta') noWanaprasta: string) {
        return this.wanaprastaService.findOne(noWanaprasta);
    }

    @Post(':noWanaprasta/setoran')
    setoran(
        @Param('noWanaprasta') noWanaprasta: string,
        @Body() dto: WanaprastaTransactionDto,
        @Req() req
    ) {
        const userId = req.user?.id || 1;
        return this.wanaprastaService.setoran(noWanaprasta, dto, userId);
    }

    @Post(':noWanaprasta/penarikan')
    penarikan(
        @Param('noWanaprasta') noWanaprasta: string,
        @Body() dto: WanaprastaTransactionDto,
        @Req() req
    ) {
        const userId = req.user?.id || 1;
        return this.wanaprastaService.penarikan(noWanaprasta, dto, userId);
    }

    @Get(':noWanaprasta/transactions')
    getTransactions(
        @Param('noWanaprasta') noWanaprasta: string,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10'
    ) {
        return this.wanaprastaService.getTransactions(
            noWanaprasta,
            parseInt(page),
            parseInt(limit)
        );
    }
    @Post(':noWanaprasta/tutup')
    close(@Param('noWanaprasta') noWanaprasta: string, @Body() body: { reason: string; penalty?: number; adminFee?: number }, @Req() req) {
        const userId = req.user?.id || 1;
        return this.wanaprastaService.closeAccount(noWanaprasta, body, userId);
    }
}
