import { IsEnum, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';
import { EventType } from '../entities/CashFlowEvent.entity';

export class CreateCashFlowEventDto {
  @IsEnum(EventType)
  eventType: EventType;

  @IsDateString()
  eventDate: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}