import { IsEnum, IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class SetoranDto {
    @IsEnum(['SETORAN_POKOK', 'SETORAN_WAJIB'])
    transType: string;

    @IsNumber()
    @Min(0)
    amount: number;

    @IsString()
    @IsOptional()
    description?: string;
}
