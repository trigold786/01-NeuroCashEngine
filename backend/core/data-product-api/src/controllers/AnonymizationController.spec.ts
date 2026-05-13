import { Test, TestingModule } from '@nestjs/testing';
import { AnonymizationController } from './AnonymizationController';
import { AnonymizationService } from '../services/AnonymizationService';

describe('AnonymizationController', () => {
  let controller: AnonymizationController;

  const mockAnonymizationService = {
    anonymizeKAnonymity: jest.fn(),
    anonymizeLDiversity: jest.fn(),
    addDifferentialPrivacy: jest.fn(),
    generalizeValue: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnonymizationController],
      providers: [
        { provide: AnonymizationService, useValue: mockAnonymizationService },
      ],
    }).compile();

    controller = module.get<AnonymizationController>(AnonymizationController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /data-product/anonymize/k-anonymity', () => {
    it('should apply k-anonymity', async () => {
      const mockResult = { records: [{ id: 1 }], suppressedCount: 0, groupsFormed: 1 };
      mockAnonymizationService.anonymizeKAnonymity.mockReturnValue(mockResult);

      const body = { data: [{ name: 'Alice', age: 30 }], quasiIdentifiers: ['age'], k: 2 };
      const result = await controller.applyKAnonymity(body);
      expect(result.success).toBe(true);
      expect(result.data.records).toHaveLength(1);
      expect(mockAnonymizationService.anonymizeKAnonymity).toHaveBeenCalledWith(body.data, body.quasiIdentifiers, body.k);
    });
  });

  describe('POST /data-product/anonymize/l-diversity', () => {
    it('should apply l-diversity', async () => {
      const mockResult = { records: [{ disease: 'Flu' }], groupsViolating: 0, totalGroups: 1 };
      mockAnonymizationService.anonymizeLDiversity.mockReturnValue(mockResult);

      const body = { data: [{ age: 30, disease: 'Flu' }], quasiIdentifiers: ['age'], sensitiveAttr: 'disease', l: 2 };
      const result = await controller.applyLDiversity(body);
      expect(result.success).toBe(true);
      expect(result.data.groupsViolating).toBe(0);
    });
  });

  describe('POST /data-product/anonymize/differential-privacy', () => {
    it('should add differential privacy noise', async () => {
      mockAnonymizationService.addDifferentialPrivacy.mockReturnValue(105.5);

      const body = { value: 100, epsilon: 1, sensitivity: 10 };
      const result = await controller.addDifferentialPrivacy(body);
      expect(result.success).toBe(true);
      expect(result.data.noisyValue).toBe(105.5);
      expect(result.data.originalValue).toBe(100);
    });
  });

  describe('GET /data-product/anonymize/generalize', () => {
    it('should return generalization examples', async () => {
      mockAnonymizationService.generalizeValue.mockImplementation((v, t) => `${v}_generalized`);

      const result = await controller.generalizeExample('42', 'age');
      expect(result.success).toBe(true);
      expect(result.data.originalValue).toBe('42');
      expect(result.data.generalizedValue).toBe('42_generalized');
      expect(mockAnonymizationService.generalizeValue).toHaveBeenCalledWith(42, 'age');
    });

    it('should return all examples when no params given', async () => {
      const result = await controller.generalizeExample(undefined, undefined);
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });
});
