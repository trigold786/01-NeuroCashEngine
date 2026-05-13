import { Controller, Get, Post, Param, Query, Req, Logger, UseGuards, HttpCode } from '@nestjs/common';
import { PortfolioMonitoringService } from '../services/PortfolioMonitoringService';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('enterprise/portfolio')
export class PortfolioMonitoringController {
  private readonly logger = new Logger(PortfolioMonitoringController.name);

  constructor(private readonly portfolioMonitoringService: PortfolioMonitoringService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getPortfolio(@Req() req: any) {
    const userId = req.user?.id || 'anonymous';
    this.logger.log(`GET /enterprise/portfolio userId=${userId}`);
    return this.portfolioMonitoringService.getPortfolio(userId);
  }

  @Get('alerts')
  @UseGuards(JwtAuthGuard)
  async getAlerts(@Req() req: any) {
    const userId = req.user?.id || 'anonymous';
    this.logger.log(`GET /enterprise/portfolio/alerts userId=${userId}`);
    return this.portfolioMonitoringService.getAlerts(userId);
  }

  @Post('alerts/:id/acknowledge')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async acknowledgeAlert(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || 'anonymous';
    this.logger.log(`POST /enterprise/portfolio/alerts/${id}/acknowledge userId=${userId}`);
    return this.portfolioMonitoringService.acknowledgeAlert(userId, id);
  }

  @Get('performance')
  @UseGuards(JwtAuthGuard)
  async getPerformance(@Query('period') period: string, @Req() req: any) {
    const userId = req.user?.id || 'anonymous';
    const p = period || '1m';
    this.logger.log(`GET /enterprise/portfolio/performance?period=${p} userId=${userId}`);
    return this.portfolioMonitoringService.getPerformance(userId, p);
  }
}
