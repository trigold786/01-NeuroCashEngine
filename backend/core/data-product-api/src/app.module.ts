import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { InvestmentSentiment } from './entities/InvestmentSentiment.entity';
import { DataProductService } from './services/DataProductService';
import { DataProductController } from './controllers/DataProductController';
import { SentimentService } from './services/SentimentService';
import { SentimentController } from './controllers/SentimentController';
import { CashFlowVelocityService } from './services/CashFlowVelocityService';
import { CashFlowVelocityController } from './controllers/CashFlowVelocityController';
import { ProductPreferenceService } from './services/ProductPreferenceService';
import { ProductPreferenceController } from './controllers/ProductPreferenceController';
import { RegionalConsumptionService } from './services/RegionalConsumptionService';
import { RegionalConsumptionController } from './controllers/RegionalConsumptionController';
import { NSICrossDataService } from './services/NSICrossDataService';
import { NSICrossDataController } from './controllers/NSICrossDataController';
import { AnonymizationService } from './services/AnonymizationService';
import { AnonymizationController } from './controllers/AnonymizationController';
import { DataAggregationService } from './services/DataAggregationService';
import { DataAggregationController } from './controllers/DataAggregationController';
import { ApiKeyAuthGuard } from './guards/ApiKeyAuth.guard';
import { OAuthGuard } from './guards/OAuthGuard';
import { RateLimitGuard } from './guards/RateLimit.guard';
import { ApiKeyController } from './controllers/ApiKeyController';
import { RateLimitConfigController } from './controllers/RateLimitConfigController';
import { ApiDocController } from './controllers/ApiDocController';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432') || 5432,
      username: process.env.DB_USER || 'nce_root',
      password: process.env.DB_PASSWORD || 'nce_root_123',
      database: process.env.DB_NAME || 'nce_db',
      entities: [InvestmentSentiment],
      synchronize: true,
      logging: process.env.NODE_ENV !== 'production',
    }),
    TypeOrmModule.forFeature([InvestmentSentiment]),
  ],
  providers: [
    DataProductService, SentimentService, CashFlowVelocityService, ProductPreferenceService, RegionalConsumptionService, NSICrossDataService, AnonymizationService, DataAggregationService,
    ApiKeyAuthGuard, OAuthGuard, RateLimitGuard,
    { provide: 'RATE_LIMIT_CONFIG', useValue: { maxRequests: 100, windowMs: 60000 } },
  ],
  controllers: [DataProductController, SentimentController, CashFlowVelocityController, ProductPreferenceController, RegionalConsumptionController, NSICrossDataController, AnonymizationController, DataAggregationController, ApiKeyController, RateLimitConfigController, ApiDocController],
})
export class AppModule {}
