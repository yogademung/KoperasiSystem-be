import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateBrahmacariDto {
  @IsNumber()
  nasabahId: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  setoranAwal?: number;

  @IsString()
  @IsOptional()
  keterangan?: string;

  @IsString()
  @IsOptional()
  studentIdCard?: string; // Path to uploaded student ID card
}
