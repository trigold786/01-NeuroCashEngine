import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './NotificationController';
import { NotificationService } from '../services/NotificationService';

describe('NotificationController', () => {
  let controller: NotificationController;

  const mockNotificationService = {
    getNotifications: jest.fn(),
    getUnreadCount: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    deleteNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /notifications', () => {
    it('should return notifications', async () => {
      mockNotificationService.getNotifications.mockResolvedValue([{ notificationId: 'n1' }]);
      mockNotificationService.getUnreadCount.mockResolvedValue(1);
      const result = await controller.getNotifications({ user: { id: 'u1' } }, 'false');
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.unreadCount).toBe(1);
    });
  });

  describe('POST /notifications/:id/read', () => {
    it('should mark notification as read', async () => {
      mockNotificationService.markAsRead.mockResolvedValue({ notificationId: 'n1', isRead: true });
      const result = await controller.markAsRead('n1');
      expect(result.success).toBe(true);
      expect(result.data.isRead).toBe(true);
    });
  });

  describe('POST /notifications/read-all', () => {
    it('should mark all as read', async () => {
      mockNotificationService.markAllAsRead.mockResolvedValue(undefined);
      const result = await controller.markAllAsRead({ user: { id: 'u1' } });
      expect(result.success).toBe(true);
    });
  });

  describe('DELETE /notifications/:id', () => {
    it('should delete notification', async () => {
      mockNotificationService.deleteNotification.mockResolvedValue(undefined);
      const result = await controller.deleteNotification('n1');
      expect(result.success).toBe(true);
    });
  });
});
