import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AssetService } from '../services/AssetService';
import { CreateAssetAccountDto } from '../dto/CreateAssetAccount.dto';

@Controller('assets')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Get('overview')
  async getOverview(@Req() req: any) {
    const userId = req.user?.id || 'demo-user-1'; // 临时使用demo id
    return await this.assetService.getAssetOverview(userId);
  }

  @Get('accounts')
  async getAccounts(@Req() req: any) {
    const userId = req.user?.id || 'demo-user-1';
    return await this.assetService.getAccounts(userId);
  }

  @Post('accounts')
  async createAccount(@Body() dto: CreateAssetAccountDto, @Req() req: any) {
    const userId = req.user?.id || 'demo-user-1';
    return await this.assetService.createAccount(userId, dto);
  }

  @Get('accounts/:id')
  async getAccount(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || 'demo-user-1';
    return await this.assetService.getAccountById(id, userId);
  }

  @Delete('accounts/:id')
  async deleteAccount(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || 'demo-user-1';
    await this.assetService.deleteAccount(id, userId);
    return { success: true };
  }
}
