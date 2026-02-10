import { Module } from '@nestjs/common';
import { ProductConfigService } from './product-config.service';
import { ProductConfigController } from './product-config.controller';
import { PrismaModule } from '../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProductConfigController],
  providers: [ProductConfigService],
  exports: [ProductConfigService],
})
export class ProductConfigModule {}
