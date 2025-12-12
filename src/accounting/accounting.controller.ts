import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AccountingService } from './accounting.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Prisma } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('accounting')
export class AccountingController {
    constructor(private readonly accountingService: AccountingService) { }

    // ============================================
    // COA ENDPOINTS
    // ============================================

    @Get('accounts')
    getAccounts(
        @Query('type') type?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string
    ) {
        console.log('GET /accounting/accounts hit. Type:', type, 'Page:', page, 'Limit:', limit);
        const pageNum = page ? parseInt(page) : 1;
        const limitNum = limit ? parseInt(limit) : 10;
        return this.accountingService.getAccounts(type, pageNum, limitNum);
    }

    @Get('accounts/parents')
    getParentAccounts() {
        return this.accountingService.getParentAccounts();
    }

    @Get('accounts/next-code')
    getNextCode(@Query('parentCode') parentCode: string) {
        return this.accountingService.generateNextCode(parentCode);
    }

    @Post('accounts')
    createAccount(@Body() data: Prisma.JournalAccountCreateInput) {
        return this.accountingService.createAccount(data);
    }

    @Put('accounts/:code')
    updateAccount(@Param('code') code: string, @Body() data: Prisma.JournalAccountUpdateInput) {
        return this.accountingService.updateAccount(code, data);
    }

    // ============================================
    // MAPPING ENDPOINTS
    // ============================================

    @Get('mappings')
    getMappings(@Query('module') module?: string) {
        return this.accountingService.getMappings(module);
    }

    @Put('mappings/:transType')
    updateMapping(
        @Param('transType') transType: string,
        @Body() body: { debitAccount: string; creditAccount: string }
    ) {
        return this.accountingService.updateMapping(transType, body.debitAccount, body.creditAccount);
    }

    // ============================================
    // JOURNAL ENDPOINTS
    // ============================================

    @Get('journals')
    getJournals(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('status') status?: string,
        @Query('sourceCode') sourceCode?: string,
        @Query('fromAccount') fromAccount?: string,
        @Query('toAccount') toAccount?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.accountingService.getJournals({
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            status,
            sourceCode,
            fromAccount,
            toAccount,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
        });
    }

    @Get('journals/:id')
    getJournalDetail(@Param('id') id: string) {
        return this.accountingService.getJournalDetail(+id);
    }

    @Post('journals/manual')
    createManualJournal(
        @Request() req,
        @Body() body: {
            date: string;
            description: string;
            details: { accountCode: string; debit: number; credit: number; description?: string }[];
        }
    ) {
        // Ensure user is authenticated and we have userId
        const userId = req.user?.id || req.user?.userId; // Adjust based on JWT strategy payload
        return this.accountingService.createManualJournal({
            date: new Date(body.date),
            description: body.description,
            userId: userId ? +userId : 1, // Fallback to 1 if not found (should be guarded)
            details: body.details
        });
    }

    @Put('/journals/:id')
    async updateManualJournal(
        @Param('id') id: string, // string from URL
        @Body() body: any, // Validate DTO properly in real app
        @Request() req
    ) {
        // ... (body validation)
        return this.accountingService.updateManualJournal(Number(id), {
            date: new Date(body.date),
            description: body.description,
            userId: req.user.userId,
            details: body.details
        });
    }

    @Delete('/journals/:id')
    async deleteJournal(
        @Param('id') id: string,
        @Body('reason') reason: string,
        @Request() req
    ) {
        return this.accountingService.deleteJournal(Number(id), req.user.userId, reason || 'Deleted by User');
    }
}
