import { Controller, Get, Post, Query, Body, Logger, UseGuards } from '@nestjs/common';
import { StrategyService } from '../services/StrategyService';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('strategy')
export class StrategyController {
  private readonly logger = new Logger(StrategyController.name);

  constructor(private readonly strategyService: StrategyService) {}

  @Post('recommend')
  @UseGuards(JwtAuthGuard)
  async getRecommendation(@Body() body: { riskProfile?: string }) {
    const riskProfile = body.riskProfile || 'conservative';
    this.logger.log(`POST /strategy/recommend with riskProfile: ${riskProfile}`);
    return this.strategyService.generateRecommendation(riskProfile);
  }

  @Get('products')
  @UseGuards(JwtAuthGuard)
  async getProducts(@Query('riskLevel') riskLevel?: string) {
    const level = riskLevel || 'conservative';
    this.logger.log(`GET /strategy/products with riskLevel: ${level}`);
    return this.strategyService.getProductsByRiskLevel(level);
  }

  @Post('risk-score')
  @UseGuards(JwtAuthGuard)
  async calculateRiskScore(@Body() answers: Record<string, string>) {
    this.logger.log(`POST /strategy/risk-score with answers: ${JSON.stringify(answers)}`);

    const scoreMap: Record<string, number> = { A: 1, B: 2, C: 3 };
    let score = 0;

    for (const key of Object.keys(answers)) {
      const answer = answers[key];
      if (scoreMap[answer] !== undefined) {
        score += scoreMap[answer];
      }
    }

    const riskProfile = this.strategyService.calculateRiskProfile(score);
    this.logger.log(`Calculated score: ${score}, riskProfile: ${riskProfile}`);

    return { riskProfile, score };
  }
}