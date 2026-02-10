import { IsNumber, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateModalDto {
  @IsNumber()
  @IsNotEmpty()
  nasabahId: number;

  @IsNumber()
  @IsOptional()
  initialDeposit: number;

  @IsString()
  @IsNotEmpty()
  regionCode: string;
}
