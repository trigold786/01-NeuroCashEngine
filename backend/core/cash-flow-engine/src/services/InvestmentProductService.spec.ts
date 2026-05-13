import { Test, TestingModule } from '@nestjs/testing';
import { InvestmentProductService } from './InvestmentProductService';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InvestmentProduct } from '../entities/InvestmentProduct.entity';
import { NotFoundException } from '@nestjs/common';

describe('InvestmentProductService', () => {
  let service: InvestmentProductService;

  const mockProductRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvestmentProductService,
        {
          provide: getRepositoryToken(InvestmentProduct),
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<InvestmentProductService>(InvestmentProductService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('seedDemoData', () => {
    it('should skip if products already exist', async () => {
      mockProductRepository.count.mockResolvedValue(5);
      const result = await service.seedDemoData();
      expect(result.message).toContain('skipping');
    });

    it('should seed 20 products', async () => {
      mockProductRepository.count.mockResolvedValue(0);
      let callCount = 0;
      mockProductRepository.create.mockImplementation((p) => ({ ...p, productId: `p-${++callCount}` }));
      mockProductRepository.save.mockImplementation(async (products) => products);

      const result = await service.seedDemoData();
      expect(result.count).toBeGreaterThanOrEqual(20);
      expect(result.message).toContain('successfully');
    });
  });

  describe('getProducts', () => {
    it('should return all products without filters', async () => {
      const mockProducts = [{ productId: 'p1' }, { productId: 'p2' }];
      mockProductRepository.find.mockResolvedValue(mockProducts);

      const result = await service.getProducts();
      expect(mockProductRepository.find).toHaveBeenCalledWith({ where: {}, order: { assetClass: 'ASC', riskLevel: 'ASC' } });
      expect(result).toEqual(mockProducts);
    });

    it('should filter by category', async () => {
      mockProductRepository.find.mockResolvedValue([]);
      await service.getProducts('货币基金');
      expect(mockProductRepository.find).toHaveBeenCalledWith({
        where: { category: '货币基金' },
        order: { assetClass: 'ASC', riskLevel: 'ASC' },
      });
    });

    it('should filter by risk level', async () => {
      mockProductRepository.find.mockResolvedValue([]);
      await service.getProducts(undefined, 3);
      expect(mockProductRepository.find).toHaveBeenCalledWith({
        where: { riskLevel: 3 },
        order: { assetClass: 'ASC', riskLevel: 'ASC' },
      });
    });
  });

  describe('getProduct', () => {
    it('should return product by id', async () => {
      const mockProduct = { productId: 'p1', productName: 'Test' };
      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.getProduct('p1');
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException for missing product', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);
      await expect(service.getProduct('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
