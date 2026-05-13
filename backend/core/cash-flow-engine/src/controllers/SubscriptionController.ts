import { Controller, Get, Post, Body, Req, UseGuards, Logger, InternalServerErrorException } from '@nestjs/common';
import { SubscriptionService } from '../services/SubscriptionService';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('subscription')
export class SubscriptionController {
  private readonly logger = new Logger(SubscriptionController.name);

  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('plan')
  @UseGuards(JwtAuthGuard)
  async getPlan(@Req() req: any) {
    try {
      const data = await this.subscriptionService.getCurrentPlan(req.user.id);
      const availableTiers = this.subscriptionService.getTiers();
      return { success: true, data, availableTiers };
    } catch (err) {
      this.logger.error('Failed to get subscription plan', err);
      throw new InternalServerErrorException('Failed to retrieve subscription plan');
    }
  }

  @Post('upgrade')
  @UseGuards(JwtAuthGuard)
  async upgrade(@Body() body: { tier: string }, @Req() req: any) {
    try {
      const data = await this.subscriptionService.upgrade(req.user.id, body.tier);
      return { success: true, data };
    } catch (err) {
      this.logger.error('Failed to upgrade subscription', err);
      throw err;
    }
  }

  @Post('cancel')
  @UseGuards(JwtAuthGuard)
  async cancel(@Req() req: any) {
    try {
      const data = await this.subscriptionService.cancel(req.user.id);
      return { success: true, data };
    } catch (err) {
      this.logger.error('Failed to cancel subscription', err);
      throw err;
    }
  }

  @Get('features')
  @UseGuards(JwtAuthGuard)
  async getFeatures(@Req() req: any) {
    try {
      const data = await this.subscriptionService.getCurrentPlan(req.user.id);
      const tiers = this.subscriptionService.getTiers();
      return { success: true, data, tiers };
    } catch (err) {
      this.logger.error('Failed to get features', err);
      throw new InternalServerErrorException('Failed to retrieve features');
    }
  }
}
