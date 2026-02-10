import { IsNumber, IsOptional, IsString } from 'class-validator';

export class TutupAnggotaDto {
  @IsString()
  @IsOptional()
  reason?: string;

  @IsNumber()
  @IsOptional()
  penaltyAmount?: number;

  @IsNumber()
  @IsOptional()
  adminFee?: number;
}
