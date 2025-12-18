
import { Controller, Get, Post, Body, Param, Patch, Delete, UseInterceptors, UploadedFiles, BadRequestException, UseGuards } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs-extra';
import sharp from 'sharp';
import { NasabahService } from './nasabah.service';
import { CreateNasabahDto } from './dto/create-nasabah.dto';
import { UpdateNasabahDto } from './dto/update-nasabah.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

const UPLOAD_DIR = './uploads/nasabah';
// Ensure upload dir exists
fs.ensureDirSync(UPLOAD_DIR);

const fileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
        return callback(new BadRequestException('Only image or PDF files are allowed!'), false);
    }
    callback(null, true);
};

@Controller('api/nasabah')
export class NasabahController {
    constructor(private readonly nasabahService: NasabahService) { }

    private async processAndSaveFile(file: Express.Multer.File, timestamp: string): Promise<string | null> {
        if (!file) return null;

        console.log('Processing file:', {
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            timestamp
        });

        const ext = extname(file.originalname).toLowerCase();
        // New filename format: fieldname_timestamp.ext
        // Example: fileKtp_2025-12-11_10-30-45.jpg (Windows-safe, no colons)
        const filename = `${file.fieldname}_${timestamp}${ext}`;
        const filePath = join(UPLOAD_DIR, filename);

        try {
            // Check if file is PDF - save directly without processing
            if (file.mimetype === 'application/pdf') {
                console.log('Saving PDF file directly without compression');
                await fs.writeFile(filePath, file.buffer);
                return `/uploads/nasabah/${filename}`;
            }

            // For images, preserve original format
            console.log('Compressing image with sharp, preserving format');
            const isPng = file.mimetype === 'image/png';

            const sharpInstance = sharp(file.buffer)
                .resize({ width: 1024, withoutEnlargement: true });

            // Use appropriate format and quality settings
            if (isPng) {
                await sharpInstance
                    .png({ quality: 80, compressionLevel: 8 })
                    .toFile(filePath);
            } else {
                // For JPEG and other formats
                await sharpInstance
                    .jpeg({ quality: 80 })
                    .toFile(filePath);
            }

            const stats = await fs.stat(filePath);
            console.log(`File saved successfully: ${filename}, format: ${isPng ? 'PNG' : 'JPEG'}, size: ${stats.size} bytes`);

            return `/uploads/nasabah/${filename}`;
        } catch (error) {
            console.error('File processing error:', {
                filename: file.originalname,
                mimetype: file.mimetype,
                error: error.message,
                stack: error.stack
            });
            throw new BadRequestException(`Gagal memproses file: ${error.message}`);
        }
    }

    @Post()
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'fileKtp', maxCount: 1 },
        { name: 'fileKk', maxCount: 1 },
    ], {
        storage: memoryStorage(), // Use memory to allow processing
        limits: { fileSize: 5 * 1024 * 1024 }, // Allow upload up to 5MB, we verify/compress later
        fileFilter: fileFilter,
    }))
    async create(
        @UploadedFiles() files: { fileKtp?: Express.Multer.File[], fileKk?: Express.Multer.File[] },
        @Body() createNasabahDto: CreateNasabahDto
    ) {
        console.log('Received Create Payload:', createNasabahDto);
        console.log('Received Files:', files);

        // Get current timestamp for filename - remove ALL invalid filename characters
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, -5);

        // Process Files with timestamp
        const fileKtpPath = files?.fileKtp?.[0] ? await this.processAndSaveFile(files.fileKtp[0], timestamp) : null;
        const fileKkPath = files?.fileKk?.[0] ? await this.processAndSaveFile(files.fileKk[0], timestamp) : null;

        const nasabahData: any = { ...createNasabahDto };

        // Cleanup
        Object.keys(nasabahData).forEach(key => {
            if (nasabahData[key] === 'null' || nasabahData[key] === 'undefined' || nasabahData[key] === '') {
                nasabahData[key] = null;
            }
        });

        if (nasabahData.tanggalLahir) {
            nasabahData.tanggalLahir = new Date(nasabahData.tanggalLahir);
        }

        return this.nasabahService.create({
            ...nasabahData,
            fileKtp: fileKtpPath,
            fileKk: fileKkPath
        } as any).catch(err => {
            // If failed, we should probably delete the uploaded files? 
            // For now, ignore orphan files to keep logic simple.
            if (err.code === 'P2002') {
                throw new BadRequestException('NIK already exists (Data duplikat)');
            }
            throw new BadRequestException(err.message || 'Gagal menyimpan data nasabah');
        });
    }

    @Get()
    findAll() {
        return this.nasabahService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.nasabahService.findOne(+id);
    }

    @Get(':id/portfolio')
    getPortfolio(@Param('id') id: string) {
        return this.nasabahService.getPortfolio(+id);
    }

    @Patch(':id')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'fileKtp', maxCount: 1 },
        { name: 'fileKk', maxCount: 1 },
    ], {
        storage: memoryStorage(),
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: fileFilter,
    }))
    async update(
        @Param('id') id: string,
        @Body() updateNasabahDto: UpdateNasabahDto,
        @UploadedFiles() files: { fileKtp?: Express.Multer.File[], fileKk?: Express.Multer.File[] }
    ) {
        // Get current timestamp for filename - remove ALL invalid filename characters
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, -5);

        // Transform path to Web URL if files exist
        const fileKtpPath = files?.fileKtp?.[0] ? await this.processAndSaveFile(files.fileKtp[0], timestamp) : undefined;
        const fileKkPath = files?.fileKk?.[0] ? await this.processAndSaveFile(files.fileKk[0], timestamp) : undefined;

        const updateData: any = { ...updateNasabahDto };

        if (fileKtpPath) updateData.fileKtp = fileKtpPath;
        if (fileKkPath) updateData.fileKk = fileKkPath;

        // Cleanup 'null' strings from FormData
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === 'null' || updateData[key] === 'undefined' || updateData[key] === '') {
                updateData[key] = null;
            }
        });

        if (updateData.tanggalLahir) {
            updateData.tanggalLahir = new Date(updateData.tanggalLahir);
        }

        return this.nasabahService.update(+id, updateData);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'kepala_koperasi')
    remove(@Param('id') id: string) {
        return this.nasabahService.remove(+id);
    }
}
