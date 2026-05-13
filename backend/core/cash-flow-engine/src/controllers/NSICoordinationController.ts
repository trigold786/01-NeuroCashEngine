import { Controller, Get, Query, UseGuards, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { NSICoordinationService, NSIUserProfile, EnhancedRiskProfile, FinancialHealthScore } from '../services/NSICoordinationService';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('nsi')
@UseGuards(JwtAuthGuard)
export class NSICoordinationController {
  private readonly logger = new Logger(NSICoordinationController.name);

  constructor(private readonly nsiService: NSICoordinationService) {}

  @Get('profile')
  async getProfile(@Query('userId') userId?: string): Promise<{ success: boolean; data: NSIUserProfile }> {
    if (!userId) {
      throw new BadRequestException('userId query parameter is required');
    }
    try {
      const data = await this.nsiService.getUserProfile(userId);
      return { success: true, data };
    } catch (err) {
      this.logger.error(`Failed to get NSI profile for user ${userId}`, err);
      throw err instanceof BadRequestException ? err : new InternalServerErrorException('Failed to retrieve NSI profile');
    }
  }

  @Get('enhanced-risk')
  async getEnhancedRisk(
    @Query('userId') userId?: string,
    @Query('baseRiskProfile') baseRiskProfile?: string,
  ): Promise<{ success: boolean; data: EnhancedRiskProfile }> {
    if (!userId || !baseRiskProfile) {
      throw new BadRequestException('userId and baseRiskProfile query parameters are required');
    }
    const validProfiles = ['conservative', 'moderate', 'aggressive'];
    if (!validProfiles.includes(baseRiskProfile)) {
      throw new BadRequestException(`Invalid baseRiskProfile. Must be one of: ${validProfiles.join(', ')}`);
    }
    try {
      const data = await this.nsiService.getEnhancedRiskProfile(userId, baseRiskProfile);
      return { success: true, data };
    } catch (err) {
      this.logger.error(`Failed to get enhanced risk for user ${userId}`, err);
      throw new InternalServerErrorException('Failed to retrieve enhanced risk profile');
    }
  }

  @Get('financial-health')
  async getFinancialHealth(@Query('userId') userId?: string): Promise<{ success: boolean; data: FinancialHealthScore }> {
    if (!userId) {
      throw new BadRequestException('userId query parameter is required');
    }
    try {
      const data = await this.nsiService.getFinancialHealthScore(userId);
      return { success: true, data };
    } catch (err) {
      this.logger.error(`Failed to get financial health for user ${userId}`, err);
      throw new InternalServerErrorException('Failed to retrieve financial health score');
    }
  }
}
