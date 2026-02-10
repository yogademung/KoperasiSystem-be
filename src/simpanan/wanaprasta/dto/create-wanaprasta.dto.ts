import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateWanaprastaDto {
  @IsNumber()
  nasabahId: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  setoranAwal?: number;

  @IsString()
  @IsOptional()
  keterangan?: string;
}
