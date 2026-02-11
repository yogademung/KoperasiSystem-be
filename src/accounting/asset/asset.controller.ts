import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AssetService } from './asset.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('api/accounting/assets')
@UseGuards(JwtAuthGuard)
export class AssetController {
  constructor(private readonly assetService: AssetService) { }

  @Post()
  create(@CurrentUser() user: any, @Body() createAssetDto: any) {
    return this.assetService.create(createAssetDto, user.id);
  }

  @Get('generate-code')
  generateCode(@Query('date') date: string) {
    if (!date) {
      throw new BadRequestException('Date is required');
    }
    return this.assetService.generateAssetCode(date);
  }

  @Get()
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.assetService.findAll(+page, +limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAssetDto: any) {
    return this.assetService.update(+id, updateAssetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetService.remove(+id);
  }

  @Post('run-depreciation')
  runDepreciation(@CurrentUser() user: any, @Body('date') dateStr?: string) {
    const userId = user.id;
    const date = dateStr ? new Date(dateStr) : new Date();
    return this.assetService.runDepreciationProcess(userId, date);
  }

  @Get(':id/calculate-depreciation')
  calculateDepreciation(
    @Param('id') id: string,
    @Query('date') dateStr?: string,
  ) {
    const date = dateStr ? new Date(dateStr) : new Date();
    return this.assetService.calculateMonthlyDepreciation(+id, date);
  }

  @Post(':id/pay')
  payAssetPurchase(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { paymentAccountId: string; amount: number; date?: string },
  ) {
    return this.assetService.payAssetPurchase({
      assetId: +id,
      paymentAccountId: body.paymentAccountId,
      amount: body.amount,
      date: body.date ? new Date(body.date) : undefined,
      userId: user.id,
    });
  }

  @Post(':id/dispose')
  disposeAsset(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body()
    body: {
      saleAmount: number;
      paymentAccountId: string;
      gainLossAccountId?: string;
      date?: string;
    },
  ) {
    return this.assetService.disposeAsset({
      assetId: +id,
      saleAmount: body.saleAmount,
      paymentAccountId: body.paymentAccountId,
      gainLossAccountId: body.gainLossAccountId,
      date: body.date ? new Date(body.date) : undefined,
      userId: user.id,
    });
  }
}
