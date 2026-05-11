import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Req,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { AssetService } from '../services/AssetService';
import { CreateAssetAccountDto } from '../dto/CreateAssetAccount.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('assets')
export class AssetController {
  private readonly logger = new Logger(AssetController.name);

  constructor(private readonly assetService: AssetService) {}

  @Get('overview')
  @UseGuards(JwtAuthGuard)
  async getOverview(@Req() req: any) {
    const userId = req.user.id;
    this.logger.log(`GET /assets/overview for userId: ${userId}`);
    try {
      return await this.assetService.getAssetOverview(userId);
    } catch (err: any) {
      this.logger.error(`Error in getOverview: ${err.message}`, err.stack);
      throw err;
    }
  }

  @Get('accounts')
  @UseGuards(JwtAuthGuard)
  async getAccounts(@Req() req: any) {
    const userId = req.user.id;
    this.logger.log(`GET /assets/accounts for userId: ${userId}`);
    try {
      return await this.assetService.getAccounts(userId);
    } catch (err: any) {
      this.logger.error(`Error in getAccounts: ${err.message}`, err.stack);
      throw err;
    }
  }

  @Post('accounts')
  @UseGuards(JwtAuthGuard)
  async createAccount(@Body() dto: CreateAssetAccountDto, @Req() req: any) {
    const userId = req.user.id;
    this.logger.log(`POST /assets/accounts for userId: ${userId}, dto: ${JSON.stringify(dto)}`);
    try {
      return await this.assetService.createAccount(userId, dto);
    } catch (err: any) {
      this.logger.error(`Error in createAccount: ${err.message}`, err.stack);
      throw err;
    }
  }

  @Get('accounts/:id')
  @UseGuards(JwtAuthGuard)
  async getAccount(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return await this.assetService.getAccountById(id, userId);
  }

  @Delete('accounts/:id')
  @UseGuards(JwtAuthGuard)
  async deleteAccount(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    await this.assetService.deleteAccount(id, userId);
    return { success: true };
  }
}