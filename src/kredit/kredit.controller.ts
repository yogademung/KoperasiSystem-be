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
        { name: 'photos', maxCount: 1 },
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
            console.log('=== COLLATERAL UPLOAD DEBUG ===');
            console.log('Payload:', JSON.stringify(data));
            console.log('Files object:', files);
            console.log('Files.photos:', files?.photos);
            console.log('Photos count:', files?.photos?.length || 0);

            if (files?.photos && files.photos.length > 0) {
                console.log('First file details:', {
                    originalname: files.photos[0].originalname,
                    mimetype: files.photos[0].mimetype,
                    size: files.photos[0].size
                });
            } else {
                console.warn('⚠️ NO FILES RECEIVED - Check frontend FormData field name must be "photos"');
            }

            // 1. Fetch Credit info for Filename
            let creditCode = `CREDIT_${id}`;
            try {
                const credit = await this.kreditService.findOne(+id);
                creditCode = credit.nomorKredit || credit.noPermohonan || `REQ_${id}`;
                creditCode = creditCode.replace(/[^a-zA-Z0-9]/g, '_');
            } catch (e) {
                console.warn('Could not fetch credit for naming, using ID');
            }

            const photoPaths: string[] = [];

            if (files?.photos) {
                const absoluteUploadDir = join(process.cwd(), 'uploads', 'collateral');
                await fs.ensureDir(absoluteUploadDir);
                console.log(`Upload directory: ${absoluteUploadDir}`);

                for (const [index, file] of files.photos.entries()) {
                    try {
                        const ext = extname(file.originalname).toLowerCase();
                        const timestamp = new Date().getTime();
                        const filename = `${creditCode}_col_${timestamp}_${index}${ext}`;
                        const filePath = join(absoluteUploadDir, filename);

                        console.log(`Saving file: ${filePath}`);

                        if (file.mimetype === 'application/pdf') {
                            await fs.writeFile(filePath, file.buffer);
                            console.log(`PDF saved successfully`);
                        } else {
                            try {
                                const pipeline = sharp(file.buffer).resize({ width: 1024, withoutEnlargement: true });

                                if (file.mimetype === 'image/png') {
                                    await pipeline.png({ quality: 80 }).toFile(filePath);
                                } else {
                                    await pipeline.jpeg({ quality: 75 }).toFile(filePath);
                                }
                                console.log(`Image processed and saved`);
                            } catch (sharpError) {
                                console.warn(`Sharp failed, using raw write:`, sharpError.message);
                                await fs.writeFile(filePath, file.buffer);
                                console.log(`Raw file saved`);
                            }
                        }

                        // Verify file exists
                        const exists = await fs.pathExists(filePath);
                        console.log(`File exists: ${exists}`);

                        photoPaths.push(`/uploads/collateral/${filename}`);
                    } catch (error) {
                        console.error(`Failed to process photo [${file.originalname}]:`, error);
                    }
                }
            }

            // Validate and Parse Payload
            const nasabahId = parseInt(data.nasabahId);
            if (isNaN(nasabahId)) throw new BadRequestException('Invalid Nasabah ID');

            const marketValue = data.marketValue ? data.marketValue.toString() : '0';
            const assessedValue = data.assessedValue ? data.assessedValue.toString() : '0';

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

    @Post(':id/payment')
<<<<<<< HEAD
    processPayment(
        @Param('id') id: string,
        @CurrentUser() user: any,
        @Body() paymentData: {
            amount: number;
            paymentDate?: string;
            keterangan?: string;
        }
    ) {
        return this.kreditService.processPayment(+id, paymentData, user.id);
=======
    payInstallment(
        @Param('id') id: string,
        @CurrentUser() user: any,
        @Body() data: any
    ) {
        return this.kreditService.payInstallment(+id, data, user.id);
>>>>>>> 328371233394512658189bf9a2043bf8648cb8ed
    }
}
