import { Test, TestingModule } from '@nestjs/testing';
import { ProductPreferenceController } from './ProductPreferenceController';
import { ProductPreferenceService } from '../services/ProductPreferenceService';

describe('ProductPreferenceController', () => {
  let controller: ProductPreferenceController;

  const mockProductPreferenceService = {
    getProductPreference: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductPreferenceController],
      providers: [
        {
          provide: ProductPreferenceService,
          useValue: mockProductPreferenceService,
        },
      ],
    }).compile();

    controller = module.get<ProductPreferenceController>(ProductPreferenceController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /data-product/product-preference', () => {
    it('should return all regions when no query param', async () => {
      const mockData = [
        { region: 'east', totalUsers: 45600, preferenceDistribution: [], riskProfileDistribution: [] },
        { region: 'central', totalUsers: 31200, preferenceDistribution: [], riskProfileDistribution: [] },
      ];
      mockProductPreferenceService.getProductPreference.mockResolvedValue(mockData);

      const result = await controller.getProductPreference();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(mockProductPreferenceService.getProductPreference).toHaveBeenCalledWith(undefined);
    });

    it('should filter by region when query param provided', async () => {
      const mockData = [
        { region: 'east', totalUsers: 45600, preferenceDistribution: [], riskProfileDistribution: [] },
      ];
      mockProductPreferenceService.getProductPreference.mockResolvedValue(mockData);

      const result = await controller.getProductPreference('east');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].region).toBe('east');
      expect(mockProductPreferenceService.getProductPreference).toHaveBeenCalledWith('east');
    });

    it('should return empty data when no matching region', async () => {
      mockProductPreferenceService.getProductPreference.mockResolvedValue([]);

      const result = await controller.getProductPreference('nonexistent');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });
  });
});
