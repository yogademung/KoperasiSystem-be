import { IsString, IsNotEmpty, IsNumber, IsDateString, IsEnum } from 'class-validator';

export class CreateExternalLoanDto {
    @IsString()
    @IsNotEmpty()
    bankName: string;

    @IsString()
    @IsNotEmpty()
    contractNumber: string;

    @IsString()
    @IsNotEmpty()
    @IsDateString()
    loanDate: string; // ISO Date

    @IsString()
    @IsNotEmpty()
    @IsDateString()
    maturityDate: string; // ISO Date

    @IsNumber()
    @IsNotEmpty()
    principal: number;

    @IsNumber()
    @IsNotEmpty()
    interestRate: number;

    @IsNumber()
    @IsNotEmpty()
    termMonths: number;

    @IsEnum(['ANUITAS', 'FLAT'])
    @IsNotEmpty()
    installmentType: 'ANUITAS' | 'FLAT';
}
