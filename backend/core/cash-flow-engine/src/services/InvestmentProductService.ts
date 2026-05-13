import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvestmentProduct } from '../entities/InvestmentProduct.entity';

@Injectable()
export class InvestmentProductService {
  private readonly logger = new Logger(InvestmentProductService.name);

  constructor(
    @InjectRepository(InvestmentProduct)
    private readonly productRepository: Repository<InvestmentProduct>,
  ) {}

  async seedDemoData(): Promise<{ count: number; message: string }> {
    const existing = await this.productRepository.count();
    if (existing > 0) {
      return { count: existing, message: 'Demo products already exist, skipping seed' };
    }

    const products: Partial<InvestmentProduct>[] = [
      // Cash (assetClass: 1)
      { productCode: 'CASH-001', productName: '活期宝', assetClass: 1, riskLevel: 1, minInvestment: 1, expectedRoi: 0.018, liquidityDays: 0, category: '货币基金', description: '随存随取，低风险现金管理工具' },
      { productCode: 'CASH-002', productName: '天天利', assetClass: 1, riskLevel: 1, minInvestment: 1000, expectedRoi: 0.022, liquidityDays: 1, category: '货币基金', description: 'T+1赎回，收益稳健' },
      { productCode: 'CASH-003', productName: '短期理财A', assetClass: 1, riskLevel: 2, minInvestment: 5000, expectedRoi: 0.028, liquidityDays: 7, category: '短期理财', description: '7天锁定期，到期自动赎回' },
      { productCode: 'CASH-004', productName: '短期理财B', assetClass: 1, riskLevel: 2, minInvestment: 10000, expectedRoi: 0.032, liquidityDays: 14, category: '短期理财', description: '14天锁定期，收益优于活期' },

      // Fixed Income (assetClass: 2)
      { productCode: 'FIX-001', productName: '国债优选', assetClass: 2, riskLevel: 1, minInvestment: 1000, expectedRoi: 0.035, liquidityDays: 365, category: '国债', description: '国债逆回购，国家信用保障' },
      { productCode: 'FIX-002', productName: '企业债A', assetClass: 2, riskLevel: 2, minInvestment: 10000, expectedRoi: 0.045, liquidityDays: 730, category: '企业债', description: 'AAA评级企业债，季度付息' },
      { productCode: 'FIX-003', productName: '纯债基金', assetClass: 2, riskLevel: 2, minInvestment: 100, expectedRoi: 0.038, liquidityDays: 2, category: '债券基金', description: '纯债策略，波动低' },
      { productCode: 'FIX-004', productName: '高收益债', assetClass: 2, riskLevel: 3, minInvestment: 50000, expectedRoi: 0.065, liquidityDays: 1095, category: '企业债', description: 'AA级信用债，年化收益较高' },
      { productCode: 'FIX-005', productName: '可转债精选', assetClass: 2, riskLevel: 3, minInvestment: 10000, expectedRoi: 0.055, liquidityDays: 180, category: '可转债', description: '可转债组合，攻守兼备' },

      // Equity (assetClass: 3)
      { productCode: 'EQ-001', productName: '沪深300指数', assetClass: 3, riskLevel: 3, minInvestment: 100, expectedRoi: 0.10, liquidityDays: 1, category: '指数基金', description: '跟踪沪深300指数' },
      { productCode: 'EQ-002', productName: '中证500指数', assetClass: 3, riskLevel: 3, minInvestment: 100, expectedRoi: 0.12, liquidityDays: 1, category: '指数基金', description: '跟踪中证500指数' },
      { productCode: 'EQ-003', productName: '科技成长基金', assetClass: 3, riskLevel: 4, minInvestment: 1000, expectedRoi: 0.18, liquidityDays: 2, category: '股票基金', description: '聚焦科技成长股' },
      { productCode: 'EQ-004', productName: '消费龙头基金', assetClass: 3, riskLevel: 3, minInvestment: 1000, expectedRoi: 0.14, liquidityDays: 2, category: '股票基金', description: '大消费板块长期配置' },
      { productCode: 'EQ-005', productName: '医药健康基金', assetClass: 3, riskLevel: 4, minInvestment: 1000, expectedRoi: 0.16, liquidityDays: 2, category: '股票基金', description: '医药健康产业投资' },

      // Alternative (assetClass: 4)
      { productCode: 'ALT-001', productName: '黄金ETF链接', assetClass: 4, riskLevel: 3, minInvestment: 100, expectedRoi: 0.08, liquidityDays: 1, category: '黄金', description: '挂钩黄金价格' },
      { productCode: 'ALT-002', productName: '原油基金', assetClass: 4, riskLevel: 4, minInvestment: 1000, expectedRoi: 0.15, liquidityDays: 2, category: '大宗商品', description: '原油期货ETF链接' },
      { productCode: 'ALT-003', productName: 'REITs精选', assetClass: 4, riskLevel: 3, minInvestment: 10000, expectedRoi: 0.06, liquidityDays: 365, category: 'REITs', description: '基础设施REITs组合' },
      { productCode: 'ALT-004', productName: '私募股权基金', assetClass: 4, riskLevel: 5, minInvestment: 1000000, expectedRoi: 0.25, liquidityDays: 1825, category: '私募股权', description: '5年锁定期，高收益预期' },
      { productCode: 'ALT-005', productName: 'CTA趋势策略', assetClass: 4, riskLevel: 4, minInvestment: 500000, expectedRoi: 0.12, liquidityDays: 90, category: '管理期货', description: '商品期货趋势跟踪策略' },
      { productCode: 'ALT-006', productName: '量化中性策略', assetClass: 4, riskLevel: 3, minInvestment: 1000000, expectedRoi: 0.09, liquidityDays: 30, category: '量化对冲', description: '市场中性，低波动绝对收益' },
    ];

    const entities = products.map((p) => this.productRepository.create(p));
    await this.productRepository.save(entities);
    this.logger.log(`Seeded ${entities.length} investment products`);
    return { count: entities.length, message: `Seeded ${entities.length} products successfully` };
  }

  async getProducts(category?: string, riskLevel?: number): Promise<InvestmentProduct[]> {
    const where: any = {};
    if (category) where.category = category;
    if (riskLevel != null) where.riskLevel = riskLevel;
    return await this.productRepository.find({ where, order: { assetClass: 'ASC', riskLevel: 'ASC' } });
  }

  async getProduct(productId: string): Promise<InvestmentProduct> {
    const product = await this.productRepository.findOne({ where: { productId } });
    if (!product) throw new NotFoundException(`Investment product ${productId} not found`);
    return product;
  }
}
