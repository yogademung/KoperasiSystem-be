import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { WanaprastaService } from './wanaprasta.service';
import { CreateWanaprastaDto } from './dto/create-wanaprasta.dto';
import { WanaprastaTransactionDto } from './dto/transaction.dto';

@Controller('api/simpanan/wanaprasta')
export class WanaprastaController {
    constructor(private readonly wanaprastaService: WanaprastaService) { }

    @Post()
    create(@Body() createDto: CreateWanaprastaDto) {
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
        @Body() dto: WanaprastaTransactionDto
    ) {
        return this.wanaprastaService.setoran(noWanaprasta, dto);
    }

    @Post(':noWanaprasta/penarikan')
    penarikan(
        @Param('noWanaprasta') noWanaprasta: string,
        @Body() dto: WanaprastaTransactionDto
    ) {
        return this.wanaprastaService.penarikan(noWanaprasta, dto);
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
}
