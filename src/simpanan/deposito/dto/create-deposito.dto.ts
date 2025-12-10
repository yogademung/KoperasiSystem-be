import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateDepositoDto {
    @IsNotEmpty()
    @IsNumber()
    nasabahId: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    nominal: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    jangkaWaktuBulan: number; // e.g., 1, 3, 6, 12

    @IsNotEmpty()
    @IsNumber()
    bunga: number; // Percentage, e.g., 5.0

    @IsOptional()
    @IsString()
    keterangan?: string;

    @IsOptional()
    @IsString()
    payoutMode?: string; // 'MATURITY', 'ROLLOVER', 'TRANSFER'

    @IsOptional()
    @IsString()
    targetAccountId?: string; // noTab for TRANSFER
}
