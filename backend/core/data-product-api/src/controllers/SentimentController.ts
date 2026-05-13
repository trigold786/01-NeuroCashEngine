import { Controller, Get, Logger, InternalServerErrorException } from '@nestjs/common';
import { SentimentService, InvestmentSentimentResponse } from '../services/SentimentService';

@Controller('sentiment')
export class SentimentController {
  private readonly logger = new Logger(SentimentController.name);

  constructor(private readonly sentimentService: SentimentService) {}

  @Get('investment')
  async getInvestmentSentiment(): Promise<{ success: boolean; data: InvestmentSentimentResponse[] }> {
    try {
      const data = await this.sentimentService.getInvestmentSentiment();
      return { success: true, data };
    } catch (err) {
      this.logger.error('Failed to get investment sentiment', err);
      throw new InternalServerErrorException('Failed to retrieve investment sentiment data');
    }
  }
}
