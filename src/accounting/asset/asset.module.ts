import { Module } from '@nestjs/common';
import { AssetService } from './asset.service';
import { AssetController } from './asset.controller';
import { AccountingModule } from '../accounting.module';
import { PrismaModule } from '../../database/prisma.module';

@Module({
    imports: [PrismaModule, AccountingModule],
    providers: [AssetService],
    controllers: [AssetController],
    exports: [AssetService],
})
export class AssetModule { }
