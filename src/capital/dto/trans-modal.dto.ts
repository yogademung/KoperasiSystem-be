import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class TransModalDto {
    @IsEnum(['SETORAN', 'PENARIKAN', 'SHU'])
    @IsNotEmpty()
    transType: 'SETORAN' | 'PENARIKAN' | 'SHU';

    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    sourceType?: string; // CASH, BANK
}
