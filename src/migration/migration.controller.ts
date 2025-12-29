import { Controller, Get, Post, UseInterceptors, UploadedFile, Body, Res, HttpException, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { MigrationService } from './migration.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('migration')
@UseGuards(JwtAuthGuard)
export class MigrationController {
    constructor(private readonly migrationService: MigrationService) { }

    @Get('journal-template')
    async downloadJournalTemplate(@Res() res: Response) {
        const buffer = await this.migrationService.generateJournalTemplate();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=template_jurnal.xlsx');
        res.send(buffer);
    }

    @Post('upload-journal')
    @UseInterceptors(FileInterceptor('file'))
    async uploadJournal(
        @UploadedFile() file: Express.Multer.File,
        @Body('journalDate') journalDate: string,
        @Req() req,
    ) {
        if (!file) {
            throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
        }
        if (!journalDate) {
            throw new HttpException('Journal date is required', HttpStatus.BAD_REQUEST);
        }
        // Assumes req.user is populated by JwtAuthGuard with user object containing id
        const userId = req.user?.id;
        if (!userId) {
            throw new HttpException('User ID not found in request', HttpStatus.UNAUTHORIZED);
        }

        return this.migrationService.uploadJournal(file.buffer, journalDate, userId);
    }

    @Get('nasabah-template')
    async downloadNasabahTemplate(@Res() res: Response) {
        const buffer = await this.migrationService.generateNasabahTemplate();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=template_nasabah.xlsx');
        res.send(buffer);
    }

    @Post('upload-nasabah')
    @UseInterceptors(FileInterceptor('file'))
    async uploadNasabah(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
        }
        return this.migrationService.uploadNasabah(file.buffer);
    }

    @Get('anggota-transaction-template')
    async downloadAnggotaTransactionTemplate(@Res() res: Response) {
        const buffer = await this.migrationService.generateAnggotaTransactionTemplate();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=template_transaksi_anggota.xlsx');
        res.send(buffer);
    }

    @Post('upload-anggota-transaction')
    @UseInterceptors(FileInterceptor('file'))
    async uploadAnggotaTransaction(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
        }
        return this.migrationService.uploadAnggotaTransaction(file.buffer);
    }
}
