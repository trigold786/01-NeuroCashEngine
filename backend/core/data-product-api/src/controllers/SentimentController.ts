import { Controller, Get } from '@nestjs/common';
import { SentimentService } from '../services/SentimentService';

@Controller('sentiment')
export class SentimentController {
  constructor(private readonly sentimentService: SentimentService) {}

  @Get('investment')
  async getInvestmentSentiment(): Promise<any> {
    const data = await this.sentimentService.getInvestmentSentiment();
    return {
      success: true,
      data,
    };
  }
}