import { Test, TestingModule } from '@nestjs/testing';
import { DataAggregationController } from './DataAggregationController';
import { DataAggregationService } from '../services/DataAggregationService';

describe('DataAggregationController', () => {
  let controller: DataAggregationController;

  const mockAggregationService = {
    aggregateByCategory: jest.fn(),
    aggregateByTimeSeries: jest.fn(),
    computeStatistics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataAggregationController],
      providers: [
        { provide: DataAggregationService, useValue: mockAggregationService },
      ],
    }).compile();

    controller = module.get<DataAggregationController>(DataAggregationController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /data-product/aggregate/category', () => {
    it('should aggregate by category', async () => {
      const mockResult = [{ category: 'A', count: 2, sum: 300, avg: 150, min: 100, max: 200 }];
      mockAggregationService.aggregateByCategory.mockReturnValue(mockResult);

      const body = { data: [{ cat: 'A', val: 100 }, { cat: 'A', val: 200 }], categoryField: 'cat', valueField: 'val' };
      const result = await controller.aggregateByCategory(body);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(mockAggregationService.aggregateByCategory).toHaveBeenCalledWith(body.data, body.categoryField, body.valueField);
    });
  });

  describe('POST /data-product/aggregate/timeseries', () => {
    it('should aggregate time series', async () => {
      const mockResult = { interval: 'month', data: [{ date: '2024-01', value: 300, count: 2 }] };
      mockAggregationService.aggregateByTimeSeries.mockReturnValue(mockResult);

      const body = { data: [{ date: '2024-01-15', val: 100 }], dateField: 'date', valueField: 'val', interval: 'month' as const };
      const result = await controller.aggregateByTimeSeries(body);
      expect(result.success).toBe(true);
      expect(result.data.interval).toBe('month');
    });
  });

  describe('POST /data-product/aggregate/statistics', () => {
    it('should compute statistics', async () => {
      const mockResult = { mean: 3.5, median: 3.5, stdDev: 1.87, min: 1, max: 6, percentile95: 6 };
      mockAggregationService.computeStatistics.mockReturnValue(mockResult);

      const body = { data: [1, 2, 3, 4, 5, 6] };
      const result = await controller.computeStatistics(body);
      expect(result.success).toBe(true);
      expect(result.data.mean).toBe(3.5);
      expect(mockAggregationService.computeStatistics).toHaveBeenCalledWith(body.data);
    });
  });
});
