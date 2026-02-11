import { Module, forwardRef } from '@nestjs/common';
import { AssetService } from './asset.service';
import { AssetController } from './asset.controller';
import { AccountingModule } from '../accounting.module';
import { PrismaModule } from '../../database/prisma.module';
import { MonthEndModule } from '../../month-end/month-end.module';

@Module({
  imports: [PrismaModule, forwardRef(() => AccountingModule), MonthEndModule],
  providers: [AssetService],
  controllers: [AssetController],
  exports: [AssetService],
})
export class AssetModule { }
