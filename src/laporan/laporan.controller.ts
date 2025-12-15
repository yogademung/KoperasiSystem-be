
import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { LaporanService } from './laporan.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('accounting/reports') // Using existing prefix convention or matching plan
@UseGuards(JwtAuthGuard)
export class LaporanController {
    constructor(private laporanService: LaporanService) { }

    @Post('simpanan/rekap')
    async simpananRekap(
        @Body() params: { startDate: string; endDate: string; format: 'PDF' | 'EXCEL'; regionCode?: string },
        @Res() res: Response
    ) {
        const buffer = await this.laporanService.generateSimpananRekap({
            ...params,
            startDate: new Date(params.startDate),
            endDate: new Date(params.endDate)
        });

        const filename = `simpanan-rekap-${Date.now()}.${params.format === 'PDF' ? 'pdf' : 'xlsx'}`;
        const contentType = params.format === 'PDF'
            ? 'application/pdf'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

        res.set({
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': buffer.length
        });

        res.send(buffer);
    }

    @Post('simpanan/tabrela')
    async tabrelaRekap(@Body() params: any, @Res() res: Response) {
        await this.handleReport(res, params, 'xlsx', () =>
            this.laporanService.generateTabrelaRekap(this.parseDates(params))
        );
    }

    @Post('simpanan/brahmacari')
    async brahmacariRekap(@Body() params: any, @Res() res: Response) {
        await this.handleReport(res, params, 'xlsx', () =>
            this.laporanService.generateBrahmacariRekap(this.parseDates(params))
        );
    }

    @Post('simpanan/balimesari')
    async balimesariRekap(@Body() params: any, @Res() res: Response) {
        await this.handleReport(res, params, 'xlsx', () =>
            this.laporanService.generateBalimesariRekap(this.parseDates(params))
        );
    }

    @Post('simpanan/wanaprasta')
    async wanaprastaRekap(@Body() params: any, @Res() res: Response) {
        await this.handleReport(res, params, 'xlsx', () =>
            this.laporanService.generateWanaprastaRekap(this.parseDates(params))
        );
    }

    @Post('simpanan/deposito')
    async depositoRekap(@Body() params: any, @Res() res: Response) {
        await this.handleReport(res, params, 'xlsx', () =>
            this.laporanService.generateDepositoRekap(this.parseDates(params))
        );
    }

    @Post('simpanan/mutasi')
    async mutasiSimpanan(@Body() params: any, @Res() res: Response) {
        await this.handleReport(res, params, 'xlsx', () =>
            this.laporanService.generateMutasiSimpanan(this.parseDates(params))
        );
    }

    @Post('simpanan/daftar')
    async daftarRekening(@Body() params: any, @Res() res: Response) {
        await this.handleReport(res, params, 'xlsx', () =>
            this.laporanService.generateDaftarRekening(params)
        );
    }

    @Post('akuntansi/neraca')
    async neraca(@Body() params: any, @Res() res: Response) {
        await this.handleReport(res, params, 'pdf', () =>
            this.laporanService.generateNeraca({
                date: new Date(params.endDate || params.date),
                format: params.format
            })
        );
    }

    @Post('akuntansi/labarugi')
    async labaRugi(@Body() params: any, @Res() res: Response) {
        await this.handleReport(res, params, 'pdf', () =>
            this.laporanService.generateLabaRugi(this.parseDates(params))
        );
    }

    // Helper handling
    private parseDates(params: any) {
        return {
            ...params,
            startDate: new Date(params.startDate),
            endDate: new Date(params.endDate)
        };
    }

    private async handleReport(res: Response, params: any, defaultExt: string, generator: () => Promise<Buffer>) {
        const buffer = await generator();
        const extension = params.format === 'PDF' ? 'pdf' : defaultExt;
        const filename = `report-${Date.now()}.${extension}`;
        const contentType = params.format === 'PDF'
            ? 'application/pdf'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

        res.set({
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': buffer.length
        });
        res.send(buffer);
    }
}
