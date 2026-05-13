import { Test, TestingModule } from '@nestjs/testing';
import { InvestmentProductController } from './InvestmentProductController';
import { InvestmentProductService } from '../services/InvestmentProductService';

describe('InvestmentProductController', () => {
  let controller: InvestmentProductController;

  const mockProductService = {
    getProducts: jest.fn(),
    getProduct: jest.fn(),
    seedDemoData: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvestmentProductController],
      providers: [
        { provide: InvestmentProductService, useValue: mockProductService },
      ],
    }).compile();

    controller = module.get<InvestmentProductController>(InvestmentProductController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProducts', () => {
    it('should return all products without filters', async () => {
      const mockProducts = [{ productId: 'p1' }, { productId: 'p2' }];
      mockProductService.getProducts.mockResolvedValue(mockProducts);

      const result = await controller.getProducts();
      expect(mockProductService.getProducts).toHaveBeenCalledWith(undefined, undefined);
      expect(result).toEqual(mockProducts);
    });

    it('should pass category and riskLevel filters', async () => {
      mockProductService.getProducts.mockResolvedValue([]);
      await controller.getProducts('债券基金', '2');
      expect(mockProductService.getProducts).toHaveBeenCalledWith('债券基金', 2);
    });
  });

  describe('getProduct', () => {
    it('should return product by id', async () => {
      const mockProduct = { productId: 'p1', productName: 'Test Product' };
      mockProductService.getProduct.mockResolvedValue(mockProduct);

      const result = await controller.getProduct('p1');
      expect(mockProductService.getProduct).toHaveBeenCalledWith('p1');
      expect(result).toEqual(mockProduct);
    });
  });

  describe('seedProducts', () => {
    it('should seed demo products', async () => {
      mockProductService.seedDemoData.mockResolvedValue({ count: 20, message: 'ok' });
      const result = await controller.seedProducts();
      expect(mockProductService.seedDemoData).toHaveBeenCalled();
      expect(result.count).toBe(20);
    });
  });
});
