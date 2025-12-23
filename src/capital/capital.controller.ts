import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CapitalService } from './capital.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateModalDto } from './dto/create-modal.dto';
import { TransModalDto } from './dto/trans-modal.dto';
import { CreateExternalLoanDto } from './dto/create-loan.dto';

@Controller('capital')
@UseGuards(JwtAuthGuard)
export class CapitalController {
    constructor(private readonly capitalService: CapitalService) { }

    @Post('members')
    createModal(@Body() dto: CreateModalDto, @Request() req) {
        // req.user is populated by JwtStrategy
        return this.capitalService.createNasabahModal(dto, req.user.userId || req.user.id);
    }

    @Get('members')
    findAllModal() {
        return this.capitalService.findAllNasabahModal();
    }

    @Get('members/:id')
    findOneModal(@Param('id') id: string) {
        // ID for Modal is string (e.g. 01MDL00001)
        return this.capitalService.findOneNasabahModal(id);
    }

    @Post('members/:id/transaction')
    addTransaction(@Param('id') id: string, @Body() dto: TransModalDto, @Request() req) {
        return this.capitalService.addModalTransaction(id, dto, req.user.userId || req.user.id);
    }

    @Post('loans')
    createLoan(@Body() dto: CreateExternalLoanDto, @Request() req) {
        return this.capitalService.createExternalLoan(dto, req.user.userId || req.user.id);
    }

    @Get('loans')
    findAllLoans() {
        return this.capitalService.findAllExternalLoans();
    }

    @Get('loans/:id')
    findOneLoan(@Param('id') id: string) {
        return this.capitalService.findOneExternalLoan(+id);
    }
}
