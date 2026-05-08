import { Controller, Get, Post, Param, Body, Req } from '@nestjs/common';
import { CashFlowService } from '../services/CashFlowService';
import { CreateCashFlowRecordDto } from '../dto/CreateCashFlowRecord.dto';

@Controller('cashflow')
export class CashFlowController {
  constructor(private readonly cashFlowService: CashFlowService) {}

  @Post('records')
  async createRecord(@Body() dto: CreateCashFlowRecordDto, @Req() req: any) {
    const userId = req.user?.id || 'demo-user-1';
    return await this.cashFlowService.createRecord(userId, dto);
  }

  @Get('accounts/:accountId/records')
  async getRecords(@Param('accountId') accountId: string, @Req() req: any) {
    const userId = req.user?.id || 'demo-user-1';
    return await this.cashFlowService.getRecordsByAccount(accountId, userId);
  }
}
