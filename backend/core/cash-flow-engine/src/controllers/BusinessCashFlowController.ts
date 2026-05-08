import { Controller, Get, Post, Delete, Param, Body, Req } from '@nestjs/common';
import { BusinessCashFlowService } from '../services/BusinessCashFlowService';
import { GenerateForecastDto } from '../dto/GenerateForecast.dto';
import { GenerateSopDto } from '../dto/GenerateSop.dto';

@Controller('business/cashflow')
export class BusinessCashFlowController {
  constructor(private readonly service: BusinessCashFlowService) {}

  @Post('forecast')
  async generateForecast(@Body() dto: GenerateForecastDto, @Req() req: any) {
    const userId = req.user?.id || 'demo-user-1';
    return await this.service.generateForecast(userId, dto);
  }

  @Get('forecast')
  async getForecast(@Req() req: any) {
    const userId = req.user?.id || 'demo-user-1';
    return await this.service.getForecast(userId);
  }

  @Post('sop')
  async generateSop(@Body() dto: GenerateSopDto, @Req() req: any) {
    const userId = req.user?.id || 'demo-user-1';
    return await this.service.generateSop(userId, dto);
  }

  @Get('sop')
  async getSops(@Req() req: any) {
    const userId = req.user?.id || 'demo-user-1';
    return await this.service.getSops(userId);
  }

  @Get('sop/:id')
  async getSopById(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || 'demo-user-1';
    return await this.service.getSopById(id, userId);
  }

  @Delete('sop/:id')
  async deleteSop(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || 'demo-user-1';
    await this.service.deleteSop(id, userId);
    return { success: true };
  }

  @Get('industries')
  async getIndustries() {
    return await this.service.getIndustries();
  }
}
