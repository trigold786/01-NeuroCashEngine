import { Controller, Get, Logger, InternalServerErrorException } from '@nestjs/common';
import { NSICrossDataService, CrossDataOverview, HealthDistribution } from '../services/NSICrossDataService';

@Controller('data-product')
export class NSICrossDataController {
  private readonly logger = new Logger(NSICrossDataController.name);

  constructor(private readonly nsiCrossDataService: NSICrossDataService) {}

  @Get('nsi-cross-data/overview')
  async getCrossDataOverview(): Promise<{ success: boolean; data: CrossDataOverview }> {
    try {
      const data = await this.nsiCrossDataService.getCrossDataOverview();
      return { success: true, data };
    } catch (err) {
      this.logger.error('Failed to get NSI cross data overview', err);
      throw new InternalServerErrorException('Failed to retrieve NSI cross data overview');
    }
  }

  @Get('nsi-cross-data/distribution')
  async getHealthDistribution(): Promise<{ success: boolean; data: HealthDistribution[] }> {
    try {
      const data = await this.nsiCrossDataService.getHealthDistribution();
      return { success: true, data };
    } catch (err) {
      this.logger.error('Failed to get health distribution', err);
      throw new InternalServerErrorException('Failed to retrieve health distribution');
    }
  }
}
