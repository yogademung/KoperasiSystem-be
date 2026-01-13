import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { BusinessUnitService } from './business-unit.service';
import { CreateBusinessUnitDto, UpdateBusinessUnitDto } from './dto/business-unit.dto';

@Controller('business-units')
export class BusinessUnitController {
    constructor(private readonly businessUnitService: BusinessUnitService) { }

    @Get()
    async findAll() {
        return this.businessUnitService.findAll();
    }

    @Get('active')
    async findActive() {
        return this.businessUnitService.findActive();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.businessUnitService.findOne(id);
    }

    @Post()
    async create(@Body() dto: CreateBusinessUnitDto) {
        return this.businessUnitService.create(dto);
    }

    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateBusinessUnitDto
    ) {
        return this.businessUnitService.update(id, dto);
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        return this.businessUnitService.delete(id);
    }
}
