import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { KreditReportService } from './kredit-report.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Response } from 'express';

@Controller('api/reports/kredit')
@UseGuards(JwtAuthGuard)
export class KreditReportController {
    constructor(private readonly kreditReportService: KreditReportService) { }

    @Get('kolektibilitas')
    async getKolektibilitas(@Query('period') period: string) {
        return this.kreditReportService.getKolektibilitas(period);
    }

    @Get('kolektibilitas/pdf')
    async downloadKolektibilitasPDF(
        @Query('period') period: string,
        @Res() res: Response
    ) {
        const pdf = await this.kreditReportService.generateKolektibilitasPDF(period);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Kolektibilitas_${period}.pdf`);
        res.send(pdf);
    }

    @Get('daftar')
    async getDaftarKredit(@Query('status') status?: string) {
        return this.kreditReportService.getDaftarKredit(status);
    }

    @Get('daftar/excel')
    async downloadDaftarKreditExcel(
        @Query('status') status: string,
        @Res() res: Response
    ) {
        const excel = await this.kreditReportService.generateDaftarKreditExcel(status);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Daftar_Kredit_${status || 'ALL'}.xlsx`);
        res.send(excel);
    }

    @Get('tunggakan')
    async getTunggakan(@Query('asOf') asOf: string) {
        return this.kreditReportService.getTunggakan(asOf);
    }

    @Get('tunggakan/pdf')
    async downloadTunggakanPDF(
        @Query('asOf') asOf: string,
        @Res() res: Response
    ) {
        const pdf = await this.kreditReportService.generateTunggakanPDF(asOf);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Tunggakan_${asOf}.pdf`);
        res.send(pdf);
    }
}
