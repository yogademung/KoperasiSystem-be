import { IsString, MinLength, IsNumber, IsOptional } from 'class-validator';

export class RegisterDto {
    @IsString()
    username: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    fullName: string;

    @IsNumber()
    roleId: number;

    @IsString()
    @IsOptional()
    regionCode?: string;
}
