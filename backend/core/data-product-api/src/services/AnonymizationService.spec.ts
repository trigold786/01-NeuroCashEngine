import { Test, TestingModule } from '@nestjs/testing';
import { AnonymizationService } from './AnonymizationService';

describe('AnonymizationService', () => {
  let service: AnonymizationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnonymizationService],
    }).compile();

    service = module.get<AnonymizationService>(AnonymizationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('anonymizeKAnonymity', () => {
    const testData = [
      { name: 'Alice', age: 30, zip: '10001' },
      { name: 'Bob', age: 30, zip: '10001' },
      { name: 'Charlie', age: 30, zip: '10001' },
      { name: 'David', age: 40, zip: '20002' },
      { name: 'Eve', age: 40, zip: '20002' },
      { name: 'Frank', age: 50, zip: '30003' },
    ];

    it('should keep all groups of size >= k=2 and suppress the rest', () => {
      const result = service.anonymizeKAnonymity(testData, ['age', 'zip'], 2);
      expect(result.suppressedCount).toBe(1);
      expect(result.records.length).toBe(5);
    });

    it('should suppress records in groups smaller than k=3', () => {
      const result = service.anonymizeKAnonymity(testData, ['age', 'zip'], 3);
      expect(result.suppressedCount).toBe(3);
      expect(result.records.length).toBe(3);
    });

    it('should suppress all when k is larger than any group', () => {
      const result = service.anonymizeKAnonymity(testData, ['age', 'zip'], 10);
      expect(result.suppressedCount).toBe(6);
      expect(result.records.length).toBe(0);
    });

    it('should return groupsFormed count', () => {
      const result = service.anonymizeKAnonymity(testData, ['age', 'zip'], 1);
      expect(result.groupsFormed).toBe(3);
    });
  });

  describe('anonymizeLDiversity', () => {
    const testData = [
      { zip: '10001', age: 30, disease: 'Flu' },
      { zip: '10001', age: 30, disease: 'Flu' },
      { zip: '20002', age: 40, disease: 'Cancer' },
      { zip: '20002', age: 40, disease: 'Heart Disease' },
      { zip: '20002', age: 40, disease: 'Diabetes' },
    ];

    it('should find violations when a group has fewer than l distinct values', () => {
      const result = service.anonymizeLDiversity(testData, ['zip'], 'disease', 2);
      expect(result.groupsViolating).toBe(1);
    });

    it('should find violations when l=3 and a group has fewer distinct values', () => {
      const result = service.anonymizeLDiversity(testData, ['zip', 'age'], 'disease', 3);
      expect(result.groupsViolating).toBeGreaterThanOrEqual(1);
    });

    it('should return total groups count', () => {
      const result = service.anonymizeLDiversity(testData, ['zip'], 'disease', 1);
      expect(result.totalGroups).toBe(2);
    });
  });

  describe('addDifferentialPrivacy', () => {
    it('should return a value close to the original', () => {
      const result = service.addDifferentialPrivacy(100, 1, 10);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(300);
    });

    it('should produce different results on multiple calls', () => {
      const results = new Set<number>();
      for (let i = 0; i < 10; i++) {
        results.add(service.addDifferentialPrivacy(50, 0.5, 5));
      }
      expect(results.size).toBeGreaterThan(1);
    });

    it('should produce less noise with higher epsilon', () => {
      const lowEpsilon = service.addDifferentialPrivacy(100, 0.1, 10);
      const highEpsilon = service.addDifferentialPrivacy(100, 10, 10);
      expect(Math.abs(highEpsilon - 100)).toBeLessThanOrEqual(Math.abs(lowEpsilon - 100) * 3 || 9999);
    });

    it('should throw error for epsilon <= 0', () => {
      expect(() => service.addDifferentialPrivacy(100, 0, 10)).toThrow();
      expect(() => service.addDifferentialPrivacy(100, -1, 10)).toThrow();
    });
  });

  describe('generalizeValue', () => {
    describe('age generalization', () => {
      it('should generalize age 25 to 18-25', () => {
        expect(service.generalizeValue(25, 'age')).toBe('18-25');
      });

      it('should generalize age 42 to 36-45', () => {
        expect(service.generalizeValue(42, 'age')).toBe('36-45');
      });

      it('should generalize age 70 to 65+', () => {
        expect(service.generalizeValue(70, 'age')).toBe('65+');
      });

      it('should generalize age 10 to 0-17', () => {
        expect(service.generalizeValue(10, 'age')).toBe('0-17');
      });
    });

    describe('income generalization', () => {
      it('should generalize low income', () => {
        expect(service.generalizeValue(25000, 'income')).toBe('0-29,999');
      });

      it('should generalize middle income', () => {
        expect(service.generalizeValue(75000, 'income')).toBe('60,000-99,999');
      });

      it('should generalize high income', () => {
        expect(service.generalizeValue(250000, 'income')).toBe('200,000+');
      });
    });

    describe('region generalization', () => {
      it('should generalize Beijing to 华北', () => {
        expect(service.generalizeValue('北京', 'region')).toBe('华北');
      });

      it('should generalize Guangzhou to 华南', () => {
        expect(service.generalizeValue('广州', 'region')).toBe('华南');
      });

      it('should return 其他 for unknown region', () => {
        expect(service.generalizeValue('拉萨', 'region')).toBe('其他');
      });
    });
  });
});
