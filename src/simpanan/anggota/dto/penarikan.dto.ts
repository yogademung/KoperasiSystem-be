import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class PenarikanDto {
  @IsNumber()
  @Min(1000)
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}
