import { Module } from '@nestjs/common';
import { MigrationController } from './migration.controller';
import { MigrationService } from './migration.service';
import { PrismaModule } from '../database/prisma.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
    imports: [
        PrismaModule,
        MulterModule.register({
            dest: './uploads/migration',
        }),
    ],
    controllers: [MigrationController],
    providers: [MigrationService],
})
export class MigrationModule { }
