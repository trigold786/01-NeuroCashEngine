import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './NotificationService';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Notification } from '../entities/Notification.entity';

describe('NotificationService', () => {
  let service: NotificationService;

  const mockNotificationRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: getRepositoryToken(Notification), useValue: mockNotificationRepository },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('send', () => {
    it('should create and return notification', async () => {
      mockNotificationRepository.create.mockReturnValue({ userId: 'u1', type: 'alert', title: 'Test', body: 'Body' });
      mockNotificationRepository.save.mockResolvedValue({ notificationId: 'n1', userId: 'u1', type: 'alert', title: 'Test', body: 'Body', isRead: false, createdAt: new Date() });
      const result = await service.send('u1', 'alert', 'Test', 'Body');
      expect(result.title).toBe('Test');
      expect(result.type).toBe('alert');
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const notif = { notificationId: 'n1', userId: 'u1', isRead: false };
      mockNotificationRepository.findOne.mockResolvedValue(notif);
      mockNotificationRepository.save.mockResolvedValue({ ...notif, isRead: true });
      const result = await service.markAsRead('n1');
      expect(result.isRead).toBe(true);
    });

    it('should throw if notification not found', async () => {
      mockNotificationRepository.findOne.mockResolvedValue(null);
      await expect(service.markAsRead('n1')).rejects.toThrow('Notification not found');
    });
  });

  describe('getNotifications', () => {
    it('should return all notifications for user', async () => {
      const notifs = [
        { notificationId: 'n1', userId: 'u1', type: 'alert', title: 'A', body: 'B', isRead: false, createdAt: new Date() },
      ];
      mockNotificationRepository.find.mockResolvedValue(notifs);
      const result = await service.getNotifications('u1');
      expect(result).toHaveLength(1);
    });

    it('should filter unread only', async () => {
      mockNotificationRepository.find.mockResolvedValue([]);
      await service.getNotifications('u1', true);
      expect(mockNotificationRepository.find).toHaveBeenCalledWith({
        where: { userId: 'u1', isRead: false },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('markAllAsRead', () => {
    it('should update all unread notifications', async () => {
      mockNotificationRepository.update.mockResolvedValue({ affected: 2 });
      await service.markAllAsRead('u1');
      expect(mockNotificationRepository.update).toHaveBeenCalledWith(
        { userId: 'u1', isRead: false },
        { isRead: true },
      );
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification', async () => {
      mockNotificationRepository.delete.mockResolvedValue({ affected: 1 });
      await service.deleteNotification('n1');
      expect(mockNotificationRepository.delete).toHaveBeenCalledWith({ notificationId: 'n1' });
    });

    it('should throw if not found', async () => {
      mockNotificationRepository.delete.mockResolvedValue({ affected: 0 });
      await expect(service.deleteNotification('n1')).rejects.toThrow('Notification not found');
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      mockNotificationRepository.count.mockResolvedValue(3);
      const result = await service.getUnreadCount('u1');
      expect(result).toBe(3);
    });
  });
});
