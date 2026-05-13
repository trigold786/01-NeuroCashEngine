import { Controller, Get, Post, Body, Req, UseGuards, Logger, InternalServerErrorException } from '@nestjs/common';
import { PointsService, PointsBalanceResponse, PointsHistoryResponse, ReferralCodeResponse } from '../services/PointsService';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('points')
export class PointsController {
  private readonly logger = new Logger(PointsController.name);

  constructor(private readonly pointsService: PointsService) {}

  @Get('balance')
  @UseGuards(JwtAuthGuard)
  async getBalance(@Req() req: any): Promise<{ success: boolean; data: PointsBalanceResponse }> {
    try {
      const data = await this.pointsService.getPoints(req.user.id);
      return { success: true, data };
    } catch (err) {
      this.logger.error('Failed to get points balance', err);
      throw new InternalServerErrorException('Failed to retrieve points balance');
    }
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getHistory(@Req() req: any): Promise<{ success: boolean; data: PointsHistoryResponse[] }> {
    try {
      const data = await this.pointsService.getHistory(req.user.id);
      return { success: true, data };
    } catch (err) {
      this.logger.error('Failed to get points history', err);
      throw new InternalServerErrorException('Failed to retrieve points history');
    }
  }

  @Post('referral/generate')
  @UseGuards(JwtAuthGuard)
  async generateReferralCode(@Req() req: any): Promise<{ success: boolean; data: ReferralCodeResponse }> {
    try {
      const data = await this.pointsService.generateReferralCode(req.user.id);
      return { success: true, data };
    } catch (err) {
      this.logger.error('Failed to generate referral code', err);
      throw new InternalServerErrorException('Failed to generate referral code');
    }
  }

  @Post('referral/redeem')
  @UseGuards(JwtAuthGuard)
  async redeemReferralCode(
    @Body() body: { code: string },
    @Req() req: any,
  ): Promise<{ success: boolean; data: { referrer: PointsBalanceResponse; newUser: PointsBalanceResponse } }> {
    try {
      const data = await this.pointsService.redeemReferralCode(body.code, req.user.id);
      return { success: true, data };
    } catch (err) {
      this.logger.error('Failed to redeem referral code', err);
      throw err;
    }
  }

  @Get('referral/code')
  @UseGuards(JwtAuthGuard)
  async getReferralCode(@Req() req: any): Promise<{ success: boolean; data: ReferralCodeResponse | null }> {
    try {
      const data = await this.pointsService.getReferralCode(req.user.id);
      return { success: true, data };
    } catch (err) {
      this.logger.error('Failed to get referral code', err);
      throw new InternalServerErrorException('Failed to retrieve referral code');
    }
  }
}
