import { Controller, Get, Param, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AssetService } from '../accounting/asset/asset.service';

@Controller('api/reports')
export class ReportsController {
    constructor(
        private readonly reportsService: ReportsService,
        private readonly assetService: AssetService,
    ) { }

    // ============================
    // ASSETS (AKTIVA)
    // ============================

    @Get('assets/balance-sheet')
    async getBalanceSheet(@Query('date') date: string) {
        return this.assetService.getBalanceSheet(date ? new Date(date) : new Date());
    }

    @Get('assets/mutations')
    async getAssetMutations(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        return this.assetService.getAssetMutations(
            startDate ? new Date(startDate) : new Date(),
            endDate ? new Date(endDate) : new Date(),
        );
    }

    // ============================
    // CREDIT (PINJAMAN)
    // ============================

    @Get('credit/:id/application') // K01
    async getCreditApplication(@Param('id') id: string) {
        return this.reportsService.getCreditApplicationData(Number(id));
    }

    @Get('credit/:id/agreement') // SPK
    async getCreditAgreement(@Param('id') id: string) {
        return this.reportsService.getCreditAgreementData(Number(id));
    }

    @Get('credit/:id/statement') // K04 (Kartu Pinjaman)
    async getCreditStatement(@Param('id') id: string) {
        return this.reportsService.getCreditStatementData(Number(id));
    }

    // ============================
    // DEPOSITO (SIMPANAN BERJANGKA)
    // ============================

    @Get('deposito/:id/certificate') // D02
    async getDepositoCertificate(@Param('id') id: string) {
        return this.reportsService.getDepositoCertificateData(id);
    }

    // ============================
    // SAVINGS (TABUNGAN)
    // ============================

    @Get('savings/:type/:id/passbook')
    async getSavingsPassbook(
        @Param('type') type: string,
        @Param('id') id: string
    ) {
        // Type: TABUNGAN, BRAHMACARI, BALIMESARI, WANAPRASTA
        return this.reportsService.getSavingsPassbookData(type as any, id);
    }
}
