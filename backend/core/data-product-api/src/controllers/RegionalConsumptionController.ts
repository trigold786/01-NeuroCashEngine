import { Controller, Get, Query, Logger, InternalServerErrorException } from '@nestjs/common';
import { RegionalConsumptionService, RegionalConsumptionResponse } from '../services/RegionalConsumptionService';

@Controller('data-product')
export class RegionalConsumptionController {
  private readonly logger = new Logger(RegionalConsumptionController.name);

  constructor(private readonly regionalConsumptionService: RegionalConsumptionService) {}

  @Get('regional-consumption')
  async getRegionalConsumption(
    @Query('region') region?: string,
  ): Promise<{ success: boolean; data: RegionalConsumptionResponse[] }> {
    try {
      const data = await this.regionalConsumptionService.getRegionalConsumption(region);
      return { success: true, data };
    } catch (err) {
      this.logger.error('Failed to get regional consumption data', err);
      throw new InternalServerErrorException('Failed to retrieve regional consumption data');
    }
  }
}
