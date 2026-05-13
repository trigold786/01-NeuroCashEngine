import { Controller, Get, Post, Query, Body, Logger, UseGuards, HttpCode, BadRequestException, HttpException, InternalServerErrorException } from '@nestjs/common';
import { StrategyService, Recommendation, Product, InvestmentStrategy, FundamentalAnalysis, TechnicalAnalysis } from '../services/StrategyService';
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

  @Get('strategy')
  @UseGuards(JwtAuthGuard)
  async getStrategy(@Query('riskProfile') riskProfile?: string): Promise<InvestmentStrategy> {
    const profile = riskProfile || 'conservative';
    if (!VALID_RISK_PROFILES.includes(profile)) {
      throw new BadRequestException(`Invalid riskProfile. Must be one of: ${VALID_RISK_PROFILES.join(', ')}`);
    }
    this.logger.log(`GET /strategy/strategy with riskProfile: ${profile}`);
    return this.strategyService.getStrategyByRiskProfile(profile);
  }

  @Post('trading-plan')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async getTradingPlan(@Body() body: { riskProfile?: string; amount?: number }): Promise<string[]> {
    const profile = body.riskProfile || 'conservative';
    const amount = body.amount || 100000;
    if (!VALID_RISK_PROFILES.includes(profile)) {
      throw new BadRequestException(`Invalid riskProfile. Must be one of: ${VALID_RISK_PROFILES.join(', ')}`);
    }
    this.logger.log(`POST /strategy/trading-plan with riskProfile: ${profile}, amount: ${amount}`);
    return this.strategyService.getTradingPlan(profile, amount);
  }

  @Get('analysis/fundamental')
  @UseGuards(JwtAuthGuard)
  async getFundamentalAnalysis(@Query('productId') productId?: string): Promise<FundamentalAnalysis> {
    const id = productId || 'P-MOD-001';
    this.logger.log(`GET /strategy/analysis/fundamental with productId: ${id}`);
    return this.strategyService.getFundamentalAnalysis(id);
  }

  @Get('analysis/technical')
  @UseGuards(JwtAuthGuard)
  async getTechnicalAnalysis(@Query('stockCode') stockCode?: string): Promise<TechnicalAnalysis> {
    const code = stockCode || '600519';
    this.logger.log(`GET /strategy/analysis/technical with stockCode: ${code}`);
    return this.strategyService.getTechnicalAnalysis(code);
  }
}
