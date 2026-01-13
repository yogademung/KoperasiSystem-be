import { Module } from '@nestjs/common';
import { BusinessUnitService } from './business-unit.service';
import { BusinessUnitController } from './business-unit.controller';
import { PrismaModule } from '../database/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [BusinessUnitService],
    controllers: [BusinessUnitController],
    exports: [BusinessUnitService]
})
export class BusinessUnitModule { }
