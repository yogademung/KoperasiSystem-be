import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class BalimesariTransactionDto {
  @IsEnum(['SETORAN', 'PENARIKAN'])
  tipeTrans: string;

  @IsNumber()
  @Min(0)
  nominal: number;

  @IsString()
  @IsOptional()
  keterangan?: string;
}
