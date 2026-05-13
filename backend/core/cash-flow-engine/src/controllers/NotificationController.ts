import { Controller, Get, Post, Delete, Param, Query, Body, Req, UseGuards, Logger, InternalServerErrorException } from '@nestjs/common';
import { NotificationService } from '../services/NotificationService';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getNotifications(
    @Req() req: any,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    try {
      const data = await this.notificationService.getNotifications(req.user.id, unreadOnly === 'true');
      const unreadCount = await this.notificationService.getUnreadCount(req.user.id);
      return { success: true, data, unreadCount };
    } catch (err) {
      this.logger.error('Failed to get notifications', err);
      throw new InternalServerErrorException('Failed to retrieve notifications');
    }
  }

  @Post(':id/read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(@Param('id') id: string) {
    try {
      const data = await this.notificationService.markAsRead(id);
      return { success: true, data };
    } catch (err) {
      this.logger.error('Failed to mark notification as read', err);
      throw err;
    }
  }

  @Post('read-all')
  @UseGuards(JwtAuthGuard)
  async markAllAsRead(@Req() req: any) {
    try {
      await this.notificationService.markAllAsRead(req.user.id);
      return { success: true };
    } catch (err) {
      this.logger.error('Failed to mark all as read', err);
      throw new InternalServerErrorException('Failed to mark all notifications as read');
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteNotification(@Param('id') id: string) {
    try {
      await this.notificationService.deleteNotification(id);
      return { success: true };
    } catch (err) {
      this.logger.error('Failed to delete notification', err);
      throw err;
    }
  }
}
