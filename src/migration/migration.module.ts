import { Module } from '@nestjs/common';
import { MigrationController } from './migration.controller';
import { MigrationService } from './migration.service';
import { PrismaModule } from '../database/prisma.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
    imports: [
        PrismaModule,
        MulterModule.register({
            storage: memoryStorage(),
        }),
    ],
    controllers: [MigrationController],
    providers: [MigrationService],
})
export class MigrationModule { }
