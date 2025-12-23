
import { Body, Controller, Get, Put, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) {
        console.log('SettingsController initialized');
    }

    @Get('profile')
    async getProfile() {
        return this.settingsService.getProfile();
    }

    @Put('profile')
    async updateProfile(@Body() data: any) {
        return this.settingsService.updateProfile(data);
    }

    @Post('logo')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads/logo',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const ext = extname(file.originalname);
                cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
            }
        })
    }))
    uploadLogo(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('No file uploaded');
        // Return URL accessible via ServeStatic
        return { url: `/uploads/logo/${file.filename}` };
    }
}
