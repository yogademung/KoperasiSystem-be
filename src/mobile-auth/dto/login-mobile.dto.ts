import { IsString, IsNotEmpty } from 'class-validator';

export class LoginMobileDto {
  @IsString()
  @IsNotEmpty()
  kodeKoperasi: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
