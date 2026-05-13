import { Controller, Get, Post, Body } from '@nestjs/common';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

@Controller('data-product/admin/rate-limit')
export class RateLimitConfigController {
  private config: RateLimitConfig = {
    maxRequests: 100,
    windowMs: 60000,
  };

  @Get()
  getConfig(): { success: boolean; data: RateLimitConfig } {
    return { success: true, data: { ...this.config } };
  }

  @Post()
  updateConfig(@Body() body: Partial<RateLimitConfig>): { success: boolean; data: RateLimitConfig } {
    if (body.maxRequests !== undefined) {
      this.config.maxRequests = body.maxRequests;
    }
    if (body.windowMs !== undefined) {
      this.config.windowMs = body.windowMs;
    }
    return { success: true, data: { ...this.config } };
  }
}
