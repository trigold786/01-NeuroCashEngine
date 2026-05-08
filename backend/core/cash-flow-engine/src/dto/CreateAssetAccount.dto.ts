import { IsString, IsEnum, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { AccountType } from '../entities/UserAssetAccount.entity';

export class CreateAssetAccountDto {
  @IsEnum(AccountType)
  accountType: AccountType;

  @IsOptional()
  @IsString()
  institutionCode?: string;

  @IsNumber()
  balance: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  accountName?: string;

  @IsOptional()
  @IsDateString()
  lastSyncTime?: string;
}
