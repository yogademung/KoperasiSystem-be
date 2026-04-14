import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UomService } from './uom.service';

@Controller('inventory/uom')
export class UomController {
  constructor(private readonly uomService: UomService) {}

  @Post()
  create(@Body() data: { code: string; name: string }) {
    return this.uomService.create(data);
  }

  @Get()
  findAll() {
    return this.uomService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: { code?: string; name?: string; isActive?: boolean }) {
    return this.uomService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.uomService.remove(+id);
  }
}
