import { IsString, IsEnum, IsOptional, IsNumber, IsDateString, IsUUID } from 'class-validator';
import { TradeType } from '../entities/CashFlowRecord.entity';

export class CreateCashFlowRecordDto {
  @IsUUID()
  accountId: string;

  @IsDateString()
  tradeTime: string;

  @IsNumber()
  amount: number;

  @IsEnum(TradeType)
  tradeType: TradeType;

  @IsOptional()
  @IsString()
  counterparty?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}
