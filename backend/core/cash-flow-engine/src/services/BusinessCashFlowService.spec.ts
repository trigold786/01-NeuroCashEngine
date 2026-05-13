import { Test, TestingModule } from '@nestjs/testing';
import { BusinessCashFlowService } from './BusinessCashFlowService';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CashFlowForecast } from '../entities/CashFlowForecast.entity';
import { SopTemplate, SopType } from '../entities/SopTemplate.entity';
import { GeneratedSop } from '../entities/GeneratedSop.entity';
import { IndustryClassification } from '../entities/IndustryClassification.entity';
import { UserAssetAccount } from '../entities/UserAssetAccount.entity';
import { CashFlowRecord } from '../entities/CashFlowRecord.entity';
import { CashFlowEvent, EventType } from '../entities/CashFlowEvent.entity';
import { DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('BusinessCashFlowService', () => {
  let service: BusinessCashFlowService;

  const mockForecastRepository = { count: jest.fn(), create: jest.fn(), save: jest.fn(), delete: jest.fn(), find: jest.fn() };
  const mockTemplateRepository = { count: jest.fn(), findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
  const mockGeneratedSopRepository = { create: jest.fn(), save: jest.fn(), find: jest.fn(), findOne: jest.fn(), delete: jest.fn() };
  const mockIndustryRepository = { count: jest.fn(), create: jest.fn(), save: jest.fn(), find: jest.fn() };
  const mockAccountRepository = { find: jest.fn() };
  const mockRecordRepository = { find: jest.fn() };
  const mockEventRepository = { count: jest.fn(), create: jest.fn(), save: jest.fn(), find: jest.fn() };
  const mockManager = { delete: jest.fn().mockResolvedValue({}), save: jest.fn().mockResolvedValue([]) };
  const mockDataSource = { transaction: jest.fn().mockImplementation((cb) => cb(mockManager)) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessCashFlowService,
        { provide: getRepositoryToken(CashFlowForecast), useValue: mockForecastRepository },
        { provide: getRepositoryToken(SopTemplate), useValue: mockTemplateRepository },
        { provide: getRepositoryToken(GeneratedSop), useValue: mockGeneratedSopRepository },
        { provide: getRepositoryToken(IndustryClassification), useValue: mockIndustryRepository },
        { provide: getRepositoryToken(UserAssetAccount), useValue: mockAccountRepository },
        { provide: getRepositoryToken(CashFlowRecord), useValue: mockRecordRepository },
        { provide: getRepositoryToken(CashFlowEvent), useValue: mockEventRepository },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<BusinessCashFlowService>(BusinessCashFlowService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initializeIndustryData', () => {
    it('should not re-initialize if data exists', async () => {
      mockIndustryRepository.count.mockResolvedValue(6);
      await service.initializeIndustryData();
      expect(mockIndustryRepository.count).toHaveBeenCalled();
      expect(mockIndustryRepository.create).not.toHaveBeenCalled();
    });

    it('should initialize data when empty', async () => {
      mockIndustryRepository.count.mockResolvedValue(0);
      mockIndustryRepository.create.mockReturnValue({});
      mockIndustryRepository.save.mockResolvedValue({});
      await service.initializeIndustryData();
      expect(mockIndustryRepository.create).toHaveBeenCalledTimes(6);
    });
  });

  describe('initializeSopTemplates', () => {
    it('should not re-initialize if templates exist', async () => {
      mockTemplateRepository.count.mockResolvedValue(4);
      await service.initializeSopTemplates();
      expect(mockTemplateRepository.create).not.toHaveBeenCalled();
    });

    it('should initialize templates when empty', async () => {
      mockTemplateRepository.count.mockResolvedValue(0);
      mockTemplateRepository.create.mockReturnValue({});
      mockTemplateRepository.save.mockResolvedValue({});
      await service.initializeSopTemplates();
      expect(mockTemplateRepository.create).toHaveBeenCalledTimes(4);
    });
  });

  describe('generateForecast', () => {
    it('should generate forecasts for user within a transaction', async () => {
      const userId = 'user-1';
      mockAccountRepository.find.mockResolvedValue([{ encryptedBalance: 'encrypted_10000' }]);
      mockEventRepository.find.mockResolvedValue([]);
      mockForecastRepository.create.mockImplementation(data => data);
      mockManager.delete.mockResolvedValue({});
      mockManager.save.mockResolvedValue([]);

      const result = await service.generateForecast(userId, { forecastDays: 7 });

      expect(mockAccountRepository.find).toHaveBeenCalledWith({ where: { userId } });
      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockManager.delete).toHaveBeenCalledWith(CashFlowForecast, { userId });
      expect(mockManager.save).toHaveBeenCalled();
    });
  });

  describe('getForecast', () => {
    it('should return forecasts for user', async () => {
      mockForecastRepository.find.mockResolvedValue([]);
      await service.getForecast('user-1');
      expect(mockForecastRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        order: { forecastDate: 'ASC' },
      });
    });
  });

  describe('generateSop', () => {
    it('should generate SOP with filled forecast data', async () => {
      const mockTemplate = {
        templateId: 'tmpl-1',
        type: 'SHORTAGE',
        content: '# SOP\nPredicted: {{predictedBalance}}\nDate: {{forecastDate}}\nAlert: {{alertDate}}\nLatest: {{latestBalance}}',
      };
      const mockForecasts = [
        { forecastDate: '2024-01-15', predictedBalance: 45000, isAlert: true },
        { forecastDate: '2024-01-20', predictedBalance: 35000, isAlert: false },
      ];

      mockTemplateRepository.findOne.mockResolvedValue(mockTemplate);
      mockForecastRepository.find.mockResolvedValue(mockForecasts);
      mockGeneratedSopRepository.create.mockImplementation(data => data);
      mockGeneratedSopRepository.save.mockImplementation(data => Promise.resolve({ sopId: 'sop-1', ...data }));

      const result = await service.generateSop('user-1', { type: SopType.SHORTAGE });

      expect(mockForecastRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        order: { forecastDate: 'ASC' },
      });
      expect(result.content).toContain('45000.00');
      expect(result.content).toContain('2024-01-15');
      expect(result.content).toContain('2024-01-12');
      expect(result.content).toContain('35000.00');
    });

    it('should throw NotFoundException when template not found', async () => {
      mockTemplateRepository.findOne.mockResolvedValue(null);

      await expect(service.generateSop('user-1', { type: SopType.SHORTAGE }))
        .rejects.toThrow();
    });
  });

  describe('getSops', () => {
    it('should return SOPs for user', async () => {
      mockGeneratedSopRepository.find.mockResolvedValue([]);
      await service.getSops('user-1');
      expect(mockGeneratedSopRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('getSopById', () => {
    it('should return SOP by id', async () => {
      mockGeneratedSopRepository.findOne.mockResolvedValue({ sopId: 'sop-1' });
      const result = await service.getSopById('sop-1', 'user-1');
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when SOP not found', async () => {
      mockGeneratedSopRepository.findOne.mockResolvedValue(null);
      await expect(service.getSopById('non-existent', 'user-1')).rejects.toThrow();
    });
  });

  describe('deleteSop', () => {
    it('should delete SOP successfully', async () => {
      mockGeneratedSopRepository.delete.mockResolvedValue({ affected: 1 });
      await expect(service.deleteSop('sop-1', 'user-1')).resolves.not.toThrow();
    });

    it('should throw NotFoundException when SOP not found', async () => {
      mockGeneratedSopRepository.delete.mockResolvedValue({ affected: 0 });
      await expect(service.deleteSop('non-existent', 'user-1')).rejects.toThrow();
    });
  });

  describe('getIndustries', () => {
    it('should return all industries', async () => {
      mockIndustryRepository.find.mockResolvedValue([]);
      await service.getIndustries();
      expect(mockIndustryRepository.find).toHaveBeenCalledWith({
        order: { industryCode: 'ASC' },
      });
    });
  });

  describe('getEvents', () => {
    it('should return events for user', async () => {
      mockEventRepository.find.mockResolvedValue([]);
      const result = await service.getEvents('user-1');
      expect(mockEventRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        order: { eventDate: 'ASC' },
      });
      expect(result).toEqual([]);
    });

    it('should return events sorted by date', async () => {
      const events = [
        { id: '1', eventDate: new Date('2024-01-01'), eventType: EventType.PAYDAY, amount: 1000 },
        { id: '2', eventDate: new Date('2024-01-15'), eventType: EventType.TAX_DUE, amount: 2000 },
      ];
      mockEventRepository.find.mockResolvedValue(events);
      const result = await service.getEvents('user-1');
      expect(result).toBe(events);
    });
  });

  describe('createEvent', () => {
    it('should create an event', async () => {
      const dto = { eventType: EventType.TAX_DUE, eventDate: '2024-01-15', amount: 15000, description: '季度税款' };
      const createdEvent = { id: 'event-1', userId: 'user-1', ...dto };
      mockEventRepository.create.mockReturnValue(createdEvent);
      mockEventRepository.save.mockResolvedValue(createdEvent);

      const result = await service.createEvent('user-1', dto);

      expect(mockEventRepository.create).toHaveBeenCalledWith({
        userId: 'user-1',
        eventType: EventType.TAX_DUE,
        eventDate: expect.any(Date),
        amount: 15000,
        description: '季度税款',
      });
      expect(result).toEqual(createdEvent);
    });
  });

  describe('seedSampleEvents', () => {
    it('should not seed if events already exist', async () => {
      mockEventRepository.count.mockResolvedValue(5);
      await service.seedSampleEvents('user-1');
      expect(mockEventRepository.create).not.toHaveBeenCalled();
    });

    it('should seed sample events when none exist', async () => {
      mockEventRepository.count.mockResolvedValue(0);
      mockEventRepository.create.mockImplementation(data => data);
      mockEventRepository.save.mockImplementation(data => Promise.resolve({ id: `event-${Math.random()}`, ...data }));
      mockEventRepository.count.mockResolvedValueOnce(0).mockResolvedValueOnce(1);

      await service.seedSampleEvents('user-1');

      expect(mockEventRepository.create).toHaveBeenCalled();
    });
  });
});