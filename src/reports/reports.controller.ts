import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { AssetService } from '../accounting/asset/asset.service';

@Controller('api/reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly assetService: AssetService,
  ) {}

  // ============================
  // COLLECTOR KPI
  // ============================

  @Get('collector/kpi')
  async getCollectorKPI(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getCollectorKPI(
      startDate ? new Date(startDate) : new Date(),
      endDate ? new Date(endDate) : new Date(),
    );
  }

  // ============================
  // ASSETS (AKTIVA)
  // ============================

  @Get('assets/balance-sheet')
  async getBalanceSheet(@Query('date') date: string) {
    return this.assetService.getBalanceSheet(
      date ? new Date(date) : new Date(),
    );
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

  @Get('credit/:id/statement') // K04
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

  @Get('deposito/:id/closure')
  async getDepositoClosure(@Param('id') id: string) {
    return this.reportsService.getDepositoClosureData(id);
  }

  // ============================
  // SAVINGS (TABUNGAN)
  // ============================

  @Get('savings/:type/:id/passbook')
  async getSavingsPassbook(
    @Param('type') type: string,
    @Param('id') id: string,
  ) {
    // Type: TABUNGAN, BRAHMACARI, BALIMESARI, WANAPRASTA
    return this.reportsService.getSavingsPassbookData(type as any, id);
  }

  @Get('savings/ANGGOTA/:id/registration')
  async getAnggotaRegistration(@Param('id') id: string) {
    return this.reportsService.getAnggotaRegistrationData(id);
  }

  @Get('savings/ANGGOTA/:id/closure')
  async getAnggotaClosure(@Param('id') id: string) {
    return this.reportsService.getAnggotaClosureData(id);
  }

  @Get('savings/ANGGOTA/:id/receipt')
  async getAnggotaReceipt(@Param('id') id: string) {
    return this.reportsService.getAnggotaReceiptData(id);
  }

  @Get('savings/TABRELA/:id/receipt')
  async getTabrelaReceipt(@Param('id') id: string) {
    return this.reportsService.getTabrelaReceiptData(id);
  }

  @Get('savings/BRAHMACARI/:id/receipt')
  async getBrahmacariReceipt(@Param('id') id: string) {
    return this.reportsService.getBrahmacariReceiptData(id);
  }

  @Get('savings/BALIMESARI/:id/receipt')
  async getBalimesariReceipt(@Param('id') id: string) {
    return this.reportsService.getBalimesariReceiptData(id);
  }

  @Get('savings/WANAPRASTA/:id/receipt')
  async getWanasprastaReceipt(@Param('id') id: string) {
    return this.reportsService.getWanasprastaReceiptData(id);
  }

  @Get('savings/TABRELA/:id/closure')
  async getTabrelaClosure(@Param('id') id: string) {
    return this.reportsService.getTabrelaClosureData(id);
  }

  @Get('savings/BRAHMACARI/:id/closure')
  async getBrahmacariClosure(@Param('id') id: string) {
    return this.reportsService.getBrahmacariClosureData(id);
  }

  @Get('savings/BALIMESARI/:id/closure')
  async getBalimesariClosure(@Param('id') id: string) {
    return this.reportsService.getBalimesariClosureData(id);
  }

  @Get('savings/WANAPRASTA/:id/closure')
  async getWanaprastaClosure(@Param('id') id: string) {
    return this.reportsService.getWanaprastaClosureData(id);
  }

  // ============================
  // ACCOUNTING (AKUNTANSI)
  // ============================

  @Get('accounting/buku-besar')
  async getBukuBesar(
    @Query('accountCode') accountCode: string,
    @Query('toAccount') toAccount: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getBukuBesar(
      accountCode,
      toAccount,
      startDate,
      endDate,
    );
  }

  @Get('accounting/buku-besar/pdf')
  async getBukuBesarPDF(
    @Query('accountCode') accountCode: string,
    @Query('toAccount') toAccount: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.generateBukuBesarPDF(
      accountCode,
      toAccount,
      startDate,
      endDate,
    );
  }

  // Simple endpoint for dropdown
  @Get('accounting/accounts-list')
  async getAccountsList() {
    return this.reportsService.getAccountsList();
  }

  @Get('accounting/coa/pdf')
  async exportCoaPdf(@Res() res: Response) {
    const buffer = await this.reportsService.exportCoaPdf();
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=COA.pdf',
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get('accounting/coa/csv')
  async exportCoaCsv(@Res() res: Response) {
    const buffer = await this.reportsService.exportCoaCsv();
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=COA.csv',
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
