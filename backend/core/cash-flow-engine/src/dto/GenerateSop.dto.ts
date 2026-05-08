import { IsString, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { SopType } from '../entities/SopTemplate.entity';

export class GenerateSopDto {
  @IsOptional()
  @IsUUID()
  forecastId?: string;

  @IsOptional()
  @IsEnum(SopType)
  type?: SopType;

  @IsOptional()
  @IsString()
  title?: string;
}
