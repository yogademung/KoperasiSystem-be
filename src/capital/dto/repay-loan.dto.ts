import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class RepayExternalLoanDto {
  @IsNotEmpty()
  @IsDateString()
  paymentDate: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;

  @IsNotEmpty()
  @IsString()
  sourceAccountId: string; // e.g., '10101' (Bank Account COA)

  @IsOptional()
  @IsString()
  description?: string;
}
