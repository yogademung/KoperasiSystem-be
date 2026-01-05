import { IsString, IsNotEmpty, IsNumber, MinLength, IsOptional, IsBoolean } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsNumber()
    @IsOptional()
    roleId?: number; // Optional role assignment

    @IsString()
    @IsOptional()
    staffId?: string;

    @IsString()
    @IsOptional()
    regionCode?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
