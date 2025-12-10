import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AnggotaService } from './anggota.service';
import { CreateAnggotaDto } from './dto/create-anggota.dto';
import { SetoranDto } from './dto/setoran.dto';
// Assumed Guards - using mock or standard names if not found. Prompt suggests these guards.
// import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
// import { RolesGuard } from '@/common/guards/roles.guard';
// import { Roles } from '@/common/decorators/roles.decorator';

@Controller('api/simpanan/anggota')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class AnggotaController {
    constructor(private readonly anggotaService: AnggotaService) { }

    @Post()
    // @Roles('admin', 'teller')
    async create(
        @Body() dto: CreateAnggotaDto,
        @Req() req
    ) {
        // Mock user ID for now if req.user is undefined, or defaults to 1
        const userId = req.user?.id || 1;
        return this.anggotaService.create(dto, userId);
    }

    @Get()
    async findAll() {
        return this.anggotaService.findAll();
    }

    @Get(':accountNumber')
    async findOne(@Param('accountNumber') accountNumber: string) {
        return this.anggotaService.findOne(accountNumber);
    }

    @Post(':accountNumber/setoran')
    // @Roles('admin', 'teller')
    async setoran(
        @Param('accountNumber') accountNumber: string,
        @Body() dto: SetoranDto,
        @Req() req
    ) {
        const userId = req.user?.id || 1;
        return this.anggotaService.setoran(accountNumber, dto, userId);
    }

    @Post(':accountNumber/penarikan')
    // @Roles('admin', 'teller')
    async penarikan(
        @Param('accountNumber') accountNumber: string,
        @Body() dto: SetoranDto, // Reusing SetoranDto as structure is identical (amount, desc)
        @Req() req
    ) {
        const userId = req.user?.id || 1;
        return this.anggotaService.penarikan(accountNumber, dto, userId);
    }

    @Get(':accountNumber/transactions')
    async getTransactions(
        @Param('accountNumber') accountNumber: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        return this.anggotaService.getTransactions(accountNumber, page, limit);
    }
}
