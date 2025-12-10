import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class CreateAnggotaDto {
    @IsNumber()
    customerId: number;

    @IsNumber()
    @Min(0)
    principal: number;

    @IsNumber()
    @Min(0)
    mandatoryInit: number;

    @IsString()
    regionCode: string;

    @IsString()
    groupCode: string;

    @IsString()
    @IsOptional()
    remark?: string;
}
