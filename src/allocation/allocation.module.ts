import { Module } from '@nestjs/common';
import { AllocationController } from './allocation.controller';
import { AllocationService } from './allocation.service';
import { PrismaModule } from '../database/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [AllocationController],
    providers: [AllocationService],
    exports: [AllocationService],
})
export class AllocationModule { }
