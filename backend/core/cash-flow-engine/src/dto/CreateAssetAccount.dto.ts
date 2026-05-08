import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateAssetAccountDto {
  @IsString()
  accountType: string;

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
