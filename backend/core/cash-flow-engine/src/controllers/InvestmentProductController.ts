import { Controller, Get, Post, Param, Query, Logger } from '@nestjs/common';
import { InvestmentProductService } from '../services/InvestmentProductService';

@Controller('products')
export class InvestmentProductController {
  private readonly logger = new Logger(InvestmentProductController.name);

  constructor(private readonly productService: InvestmentProductService) {}

  @Get()
  async getProducts(
    @Query('category') category?: string,
    @Query('riskLevel') riskLevel?: string,
  ) {
    this.logger.log(`GET /products?category=${category}&riskLevel=${riskLevel}`);
    return await this.productService.getProducts(category, riskLevel ? parseInt(riskLevel, 10) : undefined);
  }

  @Get(':id')
  async getProduct(@Param('id') id: string) {
    this.logger.log(`GET /products/${id}`);
    return await this.productService.getProduct(id);
  }

  @Post('seed')
  async seedProducts() {
    this.logger.log('POST /products/seed');
    return await this.productService.seedDemoData();
  }
}
