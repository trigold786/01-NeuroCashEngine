import { Test, TestingModule } from '@nestjs/testing';
import { DataAggregationService } from './DataAggregationService';

describe('DataAggregationService', () => {
  let service: DataAggregationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataAggregationService],
    }).compile();

    service = module.get<DataAggregationService>(DataAggregationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('aggregateByCategory', () => {
    const testData = [
      { category: 'A', value: 100 },
      { category: 'A', value: 200 },
      { category: 'B', value: 150 },
      { category: 'B', value: 50 },
      { category: 'C', value: 300 },
    ];

    it('should aggregate by category field', () => {
      const result = service.aggregateByCategory(testData, 'category', 'value');
      expect(result).toHaveLength(3);

      const catA = result.find(r => r.category === 'A');
      expect(catA).toBeDefined();
      expect(catA!.count).toBe(2);
      expect(catA!.sum).toBe(300);
      expect(catA!.avg).toBe(150);
      expect(catA!.min).toBe(100);
      expect(catA!.max).toBe(200);
    });

    it('should sort by sum descending', () => {
      const sortData = [
        { category: 'A', value: 50 },
        { category: 'B', value: 150 },
        { category: 'C', value: 300 },
      ];
      const result = service.aggregateByCategory(sortData, 'category', 'value');
      expect(result[0].category).toBe('C');
      expect(result[0].sum).toBe(300);
    });

    it('should return empty array for empty input', () => {
      const result = service.aggregateByCategory([], 'cat', 'val');
      expect(result).toHaveLength(0);
    });
  });

  describe('aggregateByTimeSeries', () => {
    it('should aggregate by day', () => {
      const data = [
        { date: '2024-01-01', value: 100 },
        { date: '2024-01-01', value: 200 },
        { date: '2024-01-02', value: 150 },
      ];
      const result = service.aggregateByTimeSeries(data, 'date', 'value', 'day');
      expect(result.interval).toBe('day');
      expect(result.data).toHaveLength(2);
      expect(result.data[0].date).toBe('2024-01-01');
      expect(result.data[0].value).toBe(300);
      expect(result.data[0].count).toBe(2);
    });

    it('should aggregate by month', () => {
      const data = [
        { date: '2024-01-15', value: 100 },
        { date: '2024-01-25', value: 200 },
        { date: '2024-02-10', value: 150 },
      ];
      const result = service.aggregateByTimeSeries(data, 'date', 'value', 'month');
      expect(result.data).toHaveLength(2);
      expect(result.data[0].date).toBe('2024-01');
      expect(result.data[1].date).toBe('2024-02');
    });

    it('should skip invalid date values', () => {
      const result = service.aggregateByTimeSeries([{ date: 'invalid-date', value: 100 }], 'date', 'value', 'day');
      expect(result.data).toHaveLength(0);
    });
  });

  describe('computeStatistics', () => {
    it('should compute correct statistics for even-length array', () => {
      const data = [1, 2, 3, 4, 5, 6];
      const result = service.computeStatistics(data);
      expect(result.mean).toBe(3.5);
      expect(result.median).toBe(3.5);
      expect(result.min).toBe(1);
      expect(result.max).toBe(6);
    });

    it('should compute correct statistics for odd-length array', () => {
      const data = [1, 2, 3, 4, 5];
      const result = service.computeStatistics(data);
      expect(result.mean).toBe(3);
      expect(result.median).toBe(3);
      expect(result.min).toBe(1);
      expect(result.max).toBe(5);
    });

    it('should compute percentile95 correctly', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
      const result = service.computeStatistics(data);
      expect(result.percentile95).toBe(19);
    });

    it('should return zeros for empty array', () => {
      const result = service.computeStatistics([]);
      expect(result.mean).toBe(0);
      expect(result.median).toBe(0);
      expect(result.stdDev).toBe(0);
      expect(result.min).toBe(0);
      expect(result.max).toBe(0);
    });

    it('should have positive stdDev for varied data', () => {
      const result = service.computeStatistics([1, 100, 200, 300, 500]);
      expect(result.stdDev).toBeGreaterThan(0);
    });
  });
});
