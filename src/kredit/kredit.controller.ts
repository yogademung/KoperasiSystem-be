import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs-extra';
import sharp from 'sharp';
import { KreditService } from './kredit.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

const UPLOAD_DIR = './uploads/collateral';
fs.ensureDirSync(UPLOAD_DIR);

const fileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
        return callback(new BadRequestException('Only image or PDF files are allowed!'), false);
    }
    callback(null, true);
};

@Controller('api/kredit')
@UseGuards(JwtAuthGuard)
export class KreditController {
    constructor(private readonly kreditService: KreditService) { }

    @Post('permohonan')
    createApplication(@CurrentUser() user: any, @Body() data: any) {
        return this.kreditService.createApplication(data, user.id);
    }

    @Get()
    findAll(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
        @Query('status') status?: string
    ) {
        return this.kreditService.findAll(+page, +limit, status);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.kreditService.findOne(+id);
    }

    @Post(':id/collateral')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'photos', maxCount: 10 },
    ], {
        storage: memoryStorage(),
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: fileFilter,
    }))
    async addCollateral(
        @Param('id') id: string,
        @CurrentUser() user: any,
        @Body() data: any,
        @UploadedFiles() files: { photos?: Express.Multer.File[] }
    ) {
        try {
            console.log('Adding Collateral - Payload:', JSON.stringify(data));
            console.log('Adding Collateral - Files:', files?.photos?.length || 0);

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, -5);
            const photoPaths: string[] = [];

            if (files?.photos) {
                for (const [index, file] of files.photos.entries()) {
                    const ext = extname(file.originalname).toLowerCase();
                    const filename = `collateral_${timestamp}_${index}${ext}`;
                    const filePath = join(UPLOAD_DIR, filename);

                    try {
                        if (file.mimetype === 'application/pdf') {
                            await fs.writeFile(filePath, file.buffer);
                        } else {
                            await sharp(file.buffer)
                                .resize({ width: 1024, withoutEnlargement: true })
                                .jpeg({ quality: 70 })
                                .toFile(filePath);
                        }
                        photoPaths.push(`/uploads/collateral/${filename}`);
                    } catch (error) {
                        console.error('Photo processing error:', error);
                        throw new BadRequestException(`Failed to process photo: ${error.message}`);
                    }
                }
            }

            // Validate and Parse Payload
            const nasabahId = parseInt(data.nasabahId);
            if (isNaN(nasabahId)) throw new BadRequestException('Invalid Nasabah ID');

            const marketValue = data.marketValue ? data.marketValue.toString() : '0';
            const assessedValue = data.assessedValue ? data.assessedValue.toString() : '0';

            // Parse FormData fields
            const payload = {
                ...data,
                nasabahId: nasabahId,
                marketValue: marketValue,
                assessedValue: assessedValue,
                details: data.details ? JSON.parse(data.details) : undefined,
                photos: JSON.stringify(photoPaths)
            };

            return await this.kreditService.addCollateral(+id, payload, user.id);

        } catch (error) {
            console.error('Add Collateral Error:', error);
            if (error instanceof BadRequestException) throw error;
            throw new BadRequestException(`Internal Error: ${error.message}`);
        }
    }

    @Post(':id/analysis')
    submitAnalysis(
        @Param('id') id: string,
        @CurrentUser() user: any,
        @Body() data: any
    ) {
        return this.kreditService.submitAnalysis(+id, data, user.id);
    }

    @Patch(':id/approve')
    approve(
        @Param('id') id: string,
        @CurrentUser() user: any,
        @Body() decision: any
    ) {
        return this.kreditService.approveCredit(+id, decision, user.id);
    }

    @Post(':id/activate')
    activate(
        @Param('id') id: string,
        @CurrentUser() user: any,
        @Body() data: any
    ) {
        return this.kreditService.activateCredit(+id, data, user.id);
    }
}
