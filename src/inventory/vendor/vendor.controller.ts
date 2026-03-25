import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VendorService } from './vendor.service';

@Controller('inventory/vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Post()
  create(@Body() data: any) {
    return this.vendorService.create(data);
  }

  @Get('aging')
  getApAging() {
    return this.vendorService.getApAging();
  }

  @Get()
  findAll() {
    return this.vendorService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.vendorService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vendorService.remove(+id);
  }
}
