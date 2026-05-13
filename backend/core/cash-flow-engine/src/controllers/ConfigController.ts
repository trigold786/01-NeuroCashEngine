import { Controller, Get, Put, Param, Body, Req, UseGuards, Logger, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '../services/ConfigService';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('config')
export class ConfigController {
  private readonly logger = new Logger(ConfigController.name);

  constructor(private readonly configService: ConfigService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAll(@Req() req: any) {
    try {
      const data = await this.configService.getAll();
      return { success: true, data };
    } catch (err) {
      this.logger.error('Failed to get configs', err);
      throw new InternalServerErrorException('Failed to retrieve configs');
    }
  }

  @Get(':key')
  @UseGuards(JwtAuthGuard)
  async getByKey(@Param('key') key: string) {
    try {
      const value = await this.configService.get(key);
      return { success: true, data: { configKey: key, configValue: value } };
    } catch (err) {
      this.logger.error('Failed to get config', err);
      throw new InternalServerErrorException('Failed to retrieve config');
    }
  }

  @Put(':key')
  @UseGuards(JwtAuthGuard)
  async setByKey(@Param('key') key: string, @Body() body: { value: string }, @Req() req: any) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admin can update config');
    }
    try {
      const data = await this.configService.set(key, body.value);
      return { success: true, data };
    } catch (err) {
      this.logger.error('Failed to set config', err);
      throw new InternalServerErrorException('Failed to update config');
    }
  }
}
