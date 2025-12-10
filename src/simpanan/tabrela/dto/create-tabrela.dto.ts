import { IsNumber, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTabrelaDto {
    @IsNotEmpty()
    @IsNumber()
    nasabahId: number;

    @IsNumber()
    @IsOptional()
    setoranAwal?: number;

    @IsString()
    @IsOptional()
    keterangan?: string;
}
