import { IsString, IsOptional, IsEmail, IsDateString } from 'class-validator';

export class CreateNasabahDto {
    @IsString()
    nama: string;

    @IsString()
    @IsOptional()
    alamat?: string;

    @IsString()
    noKtp: string;

    @IsString()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    telepon?: string;

    @IsString()
    @IsOptional()
    tempatLahir?: string;

    @IsDateString()
    @IsOptional()
    tanggalLahir?: string;

    @IsString()
    @IsOptional()
    jenisKelamin?: string;

    @IsString()
    @IsOptional()
    pekerjaan?: string;
}
