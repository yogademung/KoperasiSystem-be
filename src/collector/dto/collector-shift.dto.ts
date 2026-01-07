
import { IsNumber, IsOptional, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class DenominationDto {
    @IsNumber() @IsOptional() denom100k?: number;
    @IsNumber() @IsOptional() denom50k?: number;
    @IsNumber() @IsOptional() denom20k?: number;
    @IsNumber() @IsOptional() denom10k?: number;
    @IsNumber() @IsOptional() denom5k?: number;
    @IsNumber() @IsOptional() denom2k?: number;
    @IsNumber() @IsOptional() denom1k?: number;
    @IsNumber() @IsOptional() denom500?: number;
    @IsNumber() @IsOptional() denom200?: number;
    @IsNumber() @IsOptional() denom100?: number;
}

export class StartShiftDto {
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => DenominationDto)
    denominations: DenominationDto;
}

export class EndShiftDto {
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => DenominationDto)
    denominations: DenominationDto;
}
