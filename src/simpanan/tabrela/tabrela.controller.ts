import { Controller, Get, Post, Body, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { TabrelaService } from './tabrela.service';
import { CreateTabrelaDto } from './dto/create-tabrela.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('api/simpanan/tabrela')
// @UseGuards(JwtAuthGuard)
export class TabrelaController {
    constructor(private readonly tabrelaService: TabrelaService) { }

    @Post()
    create(@Body() createDto: CreateTabrelaDto) {
        return this.tabrelaService.create(createDto);
    }

    @Get()
    findAll() {
        return this.tabrelaService.findAll();
    }

    @Get(':noTab')
    findOne(@Param('noTab') noTab: string) {
        return this.tabrelaService.findOne(noTab);
    }

    @Post(':noTab/setoran')
    setoran(@Param('noTab') noTab: string, @Body() body: any) {
        // Using 'any' for body temporarily or reuse SetoranDto
        return this.tabrelaService.setoran(noTab, body);
    }

    @Post(':noTab/penarikan')
    penarikan(@Param('noTab') noTab: string, @Body() body: any) {
        return this.tabrelaService.penarikan(noTab, body);
    }

    @Post(':noTab/tutup')
    close(@Param('noTab') noTab: string, @Body() body: { reason: string; penalty?: number; adminFee?: number }) {
        return this.tabrelaService.closeAccount(noTab, body);
    }
}
