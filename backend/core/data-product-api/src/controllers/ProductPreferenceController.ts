import { Controller, Get, Query, Logger, InternalServerErrorException } from '@nestjs/common';
import { ProductPreferenceService, ProductPreferenceResponse } from '../services/ProductPreferenceService';

@Controller('data-product')
export class ProductPreferenceController {
  private readonly logger = new Logger(ProductPreferenceController.name);

  constructor(private readonly productPreferenceService: ProductPreferenceService) {}

  @Get('product-preference')
  async getProductPreference(
    @Query('region') region?: string,
  ): Promise<{ success: boolean; data: ProductPreferenceResponse[] }> {
    try {
      const data = await this.productPreferenceService.getProductPreference(region);
      return { success: true, data };
    } catch (err) {
      this.logger.error('Failed to get product preference', err);
      throw new InternalServerErrorException('Failed to retrieve product preference data');
    }
  }
}
