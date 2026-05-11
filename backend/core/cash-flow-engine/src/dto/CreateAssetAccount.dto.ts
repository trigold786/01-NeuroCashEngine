import { IsString, IsOptional, IsNumber, IsDateString, IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAssetAccountDto {
  @IsString()
  accountType: string;

  @IsOptional()
  @IsString()
  institutionCode?: string;

  @IsNumber()
  @IsPositive()
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

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  termYears?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  interestRate?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  fundCode?: string;

  @IsOptional()
  @IsString()
  fundName?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  buyPrice?: number;

  @IsOptional()
  @IsDateString()
  buyDate?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  shareCount?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  nav?: number;

  @IsOptional()
  @IsString()
  stockCode?: string;

  @IsOptional()
  @IsString()
  stockName?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  currentPrice?: number;
}