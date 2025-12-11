import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { BalimesariService } from './balimesari.service';
import { CreateBalimesariDto } from './dto/create-balimesari.dto';
import { BalimesariTransactionDto } from './dto/transaction.dto';

@Controller('api/simpanan/balimesari')
export class BalimesariController {
    constructor(private readonly balimesariService: BalimesariService) { }

    @Post()
    create(@Body() createDto: CreateBalimesariDto) {
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
        @Body() dto: BalimesariTransactionDto
    ) {
        return this.balimesariService.setoran(noBalimesari, dto);
    }

    @Post(':noBalimesari/penarikan')
    penarikan(
        @Param('noBalimesari') noBalimesari: string,
        @Body() dto: BalimesariTransactionDto
    ) {
        return this.balimesariService.penarikan(noBalimesari, dto);
    }

    @Get(':noBalimesari/transactions')
    getTransactions(
        @Param('noBalimesari') noBalimesari: string,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10'
    ) {
        return this.balimesariService.getTransactions(
            noBalimesari,
            parseInt(page),
            parseInt(limit)
        );
    }
}
