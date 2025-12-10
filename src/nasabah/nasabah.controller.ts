import { Controller, Get, Post, Body, Param, Patch, Delete, UseInterceptors, UploadedFiles, BadRequestException, UseGuards } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { NasabahService } from './nasabah.service';
import { CreateNasabahDto } from './dto/create-nasabah.dto';
import { UpdateNasabahDto } from './dto/update-nasabah.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

const fileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
        return callback(new BadRequestException('Only image or PDF files are allowed!'), false);
    }
    callback(null, true);
};

@Controller('api/nasabah')
export class NasabahController {
    constructor(private readonly nasabahService: NasabahService) { }

    @Post()
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'fileKtp', maxCount: 1 },
        { name: 'fileKk', maxCount: 1 },
    ], {
        storage: diskStorage({
            destination: './uploads/nasabah',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const ext = extname(file.originalname);
                cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
            },
        }),
        fileFilter: fileFilter,
        limits: { fileSize: 2000000 }, // 2MB
    }))
    create(
        @UploadedFiles() files: { fileKtp?: Express.Multer.File[], fileKk?: Express.Multer.File[] },
        @Body() createNasabahDto: CreateNasabahDto
    ) {
        console.log('Received Create Payload:', createNasabahDto);
        console.log('Received Files:', files);

        const fileKtpPath = files?.fileKtp?.[0]?.path;
        const fileKkPath = files?.fileKk?.[0]?.path;

        // Convert DTO to match Service input (renaming/mapping if necessary is handled here or in service)
        const nasabahData: any = { ...createNasabahDto };

        // Fix string 'null' or 'undefined' from FormData
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
            console.error('Error creating nasabah:', err);
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
    update(@Param('id') id: string, @Body() updateNasabahDto: UpdateNasabahDto) {
        return this.nasabahService.update(+id, updateNasabahDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'kepala_koperasi')
    remove(@Param('id') id: string) {
        return this.nasabahService.remove(+id);
    }
}
