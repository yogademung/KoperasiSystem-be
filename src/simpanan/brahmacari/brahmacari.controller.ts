import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { BrahmacariService } from './brahmacari.service';
import { CreateBrahmacariDto } from './dto/create-brahmacari.dto';
import { BrahmacariTransactionDto } from './dto/transaction.dto';

@Controller('api/simpanan/brahmacari')
export class BrahmacariController {
    constructor(private readonly brahmacariService: BrahmacariService) { }

    @Post()
    create(@Body() createDto: CreateBrahmacariDto) {
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
        @Body() dto: BrahmacariTransactionDto
    ) {
        return this.brahmacariService.setoran(noBrahmacari, dto);
    }

    @Post(':noBrahmacari/penarikan')
    penarikan(
        @Param('noBrahmacari') noBrahmacari: string,
        @Body() dto: BrahmacariTransactionDto
    ) {
        return this.brahmacariService.penarikan(noBrahmacari, dto);
    }

    @Get(':noBrahmacari/transactions')
    getTransactions(
        @Param('noBrahmacari') noBrahmacari: string,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10'
    ) {
        return this.brahmacariService.getTransactions(
            noBrahmacari,
            parseInt(page),
            parseInt(limit)
        );
    }
}
