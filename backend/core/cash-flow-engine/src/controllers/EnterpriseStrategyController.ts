import { Controller, Get, Post, Query, Body, Logger, UseGuards, HttpCode, BadRequestException } from '@nestjs/common';
import { EnterpriseStrategyService, EnterpriseQuestionnaire } from '../services/EnterpriseStrategyService';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const VALID_PROFILES = ['conservative', 'stable', 'aggressive'];

@Controller('enterprise/strategy')
export class EnterpriseStrategyController {
  private readonly logger = new Logger(EnterpriseStrategyController.name);

  constructor(private readonly enterpriseStrategyService: EnterpriseStrategyService) {}

  @Post('assess')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async assessRiskProfile(@Body() answers: EnterpriseQuestionnaire) {
    this.logger.log(`POST /enterprise/strategy/assess`);
    return this.enterpriseStrategyService.assessRiskProfile(answers);
  }

  @Get('products')
  @UseGuards(JwtAuthGuard)
  async getProducts(
    @Query('riskProfile') riskProfile?: string,
    @Query('liquidityDays') liquidityDays?: string,
  ) {
    const profile = riskProfile || 'conservative';
    if (!VALID_PROFILES.includes(profile)) {
      throw new BadRequestException(`Invalid riskProfile. Must be one of: ${VALID_PROFILES.join(', ')}`);
    }
    const days = liquidityDays ? parseInt(liquidityDays, 10) : undefined;
    this.logger.log(`GET /enterprise/strategy/products?riskProfile=${profile}&liquidityDays=${days}`);
    return this.enterpriseStrategyService.getProductsByProfile(profile, days);
  }

  @Get('portfolio')
  @UseGuards(JwtAuthGuard)
  async getPortfolioMetrics(@Query('riskProfile') riskProfile?: string) {
    const profile = riskProfile || 'conservative';
    if (!VALID_PROFILES.includes(profile)) {
      throw new BadRequestException(`Invalid riskProfile. Must be one of: ${VALID_PROFILES.join(', ')}`);
    }
    this.logger.log(`GET /enterprise/strategy/portfolio?riskProfile=${profile}`);
    return this.enterpriseStrategyService.getPortfolioMetrics(profile);
  }

  @Get('templates')
  @UseGuards(JwtAuthGuard)
  async getStrategyTemplates() {
    this.logger.log('GET /enterprise/strategy/templates');
    return this.enterpriseStrategyService.getStrategyTemplates();
  }
}
