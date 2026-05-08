import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { AccountType } from '../user.entity';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(AccountType)
  accountType?: AccountType;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  industryCode?: string;

  @IsOptional()
  @IsString()
  industryName?: string;
}
