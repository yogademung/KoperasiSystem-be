import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PosProductService } from './pos-product.service';

@Controller('pos/products')
export class PosProductController {
  constructor(private readonly posProductService: PosProductService) {}

  @Post()
  create(@Body() data: any) {
    return this.posProductService.create(data);
  }

  @Get()
  findAll() {
    return this.posProductService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.posProductService.findOne(+id);
  }

  @Get(':id/calculate-cogs')
  calculateCogs(@Param('id') id: string) {
    return this.posProductService.calculateCogs(+id);
  }

  @Post(':id/sync-cogs')
  syncCogs(@Param('id') id: string) {
    return this.posProductService.syncCogs(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.posProductService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.posProductService.remove(+id);
  }
}
