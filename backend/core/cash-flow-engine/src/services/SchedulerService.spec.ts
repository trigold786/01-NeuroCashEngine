import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerService } from './SchedulerService';
import { BusinessCashFlowService } from './BusinessCashFlowService';

describe('SchedulerService', () => {
  let service: SchedulerService;
  let businessService: BusinessCashFlowService;

  const mockBusinessService = {
    generateForecast: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulerService,
        { provide: BusinessCashFlowService, useValue: mockBusinessService },
      ],
    }).compile();

    service = module.get<SchedulerService>(SchedulerService);
    businessService = module.get<BusinessCashFlowService>(BusinessCashFlowService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should start data refresh for a user', () => {
    service.startDataRefresh('user-1', 60);
    expect(service.isRefreshing('user-1')).toBe(true);
    expect(service.getRefreshInfo('user-1')).toEqual({ intervalMinutes: 60 });
  });

  it('should stop data refresh for a user', () => {
    service.startDataRefresh('user-1', 60);
    expect(service.isRefreshing('user-1')).toBe(true);
    service.stopDataRefresh('user-1');
    expect(service.isRefreshing('user-1')).toBe(false);
    expect(service.getRefreshInfo('user-1')).toBeNull();
  });

  it('should call generateForecast on interval', () => {
    service.startDataRefresh('user-1', 1);
    jest.advanceTimersByTime(60000);
    expect(mockBusinessService.generateForecast).toHaveBeenCalledWith('user-1', { forecastDays: 90 });
  });

  it('should return null for unknown user', () => {
    expect(service.getRefreshInfo('unknown')).toBeNull();
    expect(service.isRefreshing('unknown')).toBe(false);
  });

  it('should clean up all timers on destroy', () => {
    service.startDataRefresh('user-1', 60);
    service.startDataRefresh('user-2', 30);
    service.onModuleDestroy();
    expect(service.isRefreshing('user-1')).toBe(false);
    expect(service.isRefreshing('user-2')).toBe(false);
  });
});
