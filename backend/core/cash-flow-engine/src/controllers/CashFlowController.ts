import { Controller, Get, Post, Param, Body, Req, Query, Logger } from '@nestjs/common';
import { CashFlowService } from '../services/CashFlowService';
import { CashFlowRecordService } from '../services/CashFlowRecordService';
import { CreateCashFlowRecordDto } from '../dto/CreateCashFlowRecord.dto';

@Controller('cashflow')
export class CashFlowController {
  private readonly logger = new Logger(CashFlowController.name);

  constructor(
    private readonly cashFlowService: CashFlowService,
    private readonly cashFlowRecordService: CashFlowRecordService,
  ) {}

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

  @Post('records/seed')
  async seedDemoData(@Req() req: any) {
    const userId = req.user?.id || 'demo-user-1';
    this.logger.log(`POST /cashflow/records/seed for userId: ${userId}`);
    return await this.cashFlowRecordService.seedDemoData(userId);
  }

  @Get('records/statistics')
  async getStatistics(
    @Req() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const userId = req.user?.id || 'demo-user-1';
    this.logger.log(`GET /cashflow/records/statistics for userId: ${userId}`);
    return await this.cashFlowRecordService.getStatistics(userId, startDate, endDate);
  }
}
