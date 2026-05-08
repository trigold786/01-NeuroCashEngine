import { IsOptional, IsNumber, IsDateString } from 'class-validator';

export class GenerateForecastDto {
  @IsOptional()
  @IsNumber()
  forecastDays?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;
}
