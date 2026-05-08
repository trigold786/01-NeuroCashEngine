import { IsString, IsOptional, IsNumber, IsDateString, IsUUID } from 'class-validator';

export class CreateCashFlowRecordDto {
  @IsUUID()
  accountId: string;

  @IsDateString()
  tradeTime: string;

  @IsNumber()
  amount: number;

  @IsString()
  tradeType: string;

  @IsOptional()
  @IsString()
  counterparty?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}
