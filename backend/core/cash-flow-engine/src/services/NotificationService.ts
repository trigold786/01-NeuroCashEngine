import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/Notification.entity';

export interface NotificationResponse {
  notificationId: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: Date;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async send(userId: string, type: string, title: string, body: string): Promise<NotificationResponse> {
    const notification = await this.notificationRepository.save(
      this.notificationRepository.create({ userId, type, title, body }),
    );
    return this.toResponse(notification);
  }

  async markAsRead(notificationId: string): Promise<NotificationResponse> {
    const notification = await this.notificationRepository.findOne({ where: { notificationId } });
    if (!notification) throw new NotFoundException('Notification not found');
    notification.isRead = true;
    await this.notificationRepository.save(notification);
    return this.toResponse(notification);
  }

  async getNotifications(userId: string, unreadOnly?: boolean): Promise<NotificationResponse[]> {
    const where: any = { userId };
    if (unreadOnly) where.isRead = false;
    const notifications = await this.notificationRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
    return notifications.map(n => this.toResponse(n));
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update({ userId, isRead: false }, { isRead: true });
  }

  async deleteNotification(notificationId: string): Promise<void> {
    const result = await this.notificationRepository.delete({ notificationId });
    if (result.affected === 0) throw new NotFoundException('Notification not found');
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({ where: { userId, isRead: false } });
  }

  private toResponse(n: Notification): NotificationResponse {
    return {
      notificationId: n.notificationId,
      userId: n.userId,
      type: n.type,
      title: n.title,
      body: n.body,
      isRead: n.isRead,
      createdAt: n.createdAt,
    };
  }
}
