import { Controller, Get, Post, Delete, Param, Body, Req, Res } from '@nestjs/common';
import { BusinessCashFlowService } from '../services/BusinessCashFlowService';
import { SopExportService } from '../services/SopExportService';
import { GenerateForecastDto } from '../dto/GenerateForecast.dto';
import { GenerateSopDto } from '../dto/GenerateSop.dto';
import { CreateCashFlowEventDto } from '../dto/CreateCashFlowEvent.dto';

@Controller('business/cashflow')
export class BusinessCashFlowController {
  constructor(
    private readonly service: BusinessCashFlowService,
    private readonly sopExportService: SopExportService,
  ) {}

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

  @Get('events')
  async getEvents(@Req() req: any) {
    const userId = req.user?.id || 'demo-user-1';
    return await this.service.getEvents(userId);
  }

  @Post('events')
  async createEvent(@Body() dto: CreateCashFlowEventDto, @Req() req: any) {
    const userId = req.user?.id || 'demo-user-1';
    return await this.service.createEvent(userId, dto);
  }

  @Post('events/seed')
  async seedEvents(@Req() req: any) {
    const userId = req.user?.id || 'demo-user-1';
    await this.service.seedSampleEvents(userId);
    return { success: true };
  }

  @Get('sop/:id/export/pdf')
  async exportSopPdf(@Param('id') id: string, @Req() req: any, @Res() res: any) {
    const userId = req.user?.id || 'demo-user-1';
    const html = await this.sopExportService.generatePdf(id, userId);
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="sop-${id}.html"`);
    return res.send(html);
  }

  @Get('sop/:id/export/markdown')
  async exportSopMarkdown(@Param('id') id: string, @Req() req: any, @Res() res: any) {
    const userId = req.user?.id || 'demo-user-1';
    const markdown = await this.sopExportService.generateMarkdown(id, userId);
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="sop-${id}.md"`);
    return res.send(markdown);
  }
}
