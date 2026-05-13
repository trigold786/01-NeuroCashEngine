import { Controller, Get, Query, Logger, InternalServerErrorException } from '@nestjs/common';
import { CashFlowVelocityService, CashFlowVelocityResponse } from '../services/CashFlowVelocityService';

@Controller('data-product')
export class CashFlowVelocityController {
  private readonly logger = new Logger(CashFlowVelocityController.name);

  constructor(private readonly cashFlowVelocityService: CashFlowVelocityService) {}

  @Get('cash-flow-velocity')
  async getCashFlowVelocity(
    @Query('industry') industry?: string,
  ): Promise<{ success: boolean; data: CashFlowVelocityResponse[] }> {
    try {
      const data = await this.cashFlowVelocityService.getCashFlowVelocity(industry);
      return { success: true, data };
    } catch (err) {
      this.logger.error('Failed to get cash flow velocity', err);
      throw new InternalServerErrorException('Failed to retrieve cash flow velocity data');
    }
  }
}
