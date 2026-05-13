import { Controller, Get, Post, Query, Body, Logger, UseGuards, HttpCode, BadRequestException, HttpException, InternalServerErrorException } from '@nestjs/common';
import { StrategyService, Recommendation, Product } from '../services/StrategyService';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const VALID_RISK_PROFILES = ['conservative', 'moderate', 'aggressive'];

@Controller('strategy')
export class StrategyController {
  private readonly logger = new Logger(StrategyController.name);

  constructor(private readonly strategyService: StrategyService) {}

  @Post('recommend')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async getRecommendation(@Body() body: { riskProfile?: string }): Promise<Recommendation> {
    const riskProfile = body.riskProfile || 'conservative';
    if (!VALID_RISK_PROFILES.includes(riskProfile)) {
      throw new BadRequestException(`Invalid riskProfile. Must be one of: ${VALID_RISK_PROFILES.join(', ')}`);
    }
    this.logger.log(`POST /strategy/recommend with riskProfile: ${riskProfile}`);
    return this.strategyService.generateRecommendation(riskProfile);
  }

  @Get('products')
  @UseGuards(JwtAuthGuard)
  async getProducts(@Query('riskLevel') riskLevel?: string): Promise<Product[]> {
    const level = riskLevel || 'conservative';
    if (!VALID_RISK_PROFILES.includes(level)) {
      throw new BadRequestException(`Invalid riskLevel. Must be one of: ${VALID_RISK_PROFILES.join(', ')}`);
    }
    this.logger.log(`GET /strategy/products with riskLevel: ${level}`);
    return this.strategyService.getProductsByRiskLevel(level);
  }

  @Post('risk-score')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async calculateRiskScore(@Body() answers: Record<string, string>): Promise<{ riskProfile: string; score: number }> {
    this.logger.log(`POST /strategy/risk-score with answers: ${JSON.stringify(answers)}`);
    return this.strategyService.calculateRiskScore(answers);
  }
}
