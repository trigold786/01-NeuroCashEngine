import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserAssetAccount } from './entities/UserAssetAccount.entity';
import { CashFlowRecord } from './entities/CashFlowRecord.entity';
import { CashFlowForecast } from './entities/CashFlowForecast.entity';
import { SopTemplate } from './entities/SopTemplate.entity';
import { GeneratedSop } from './entities/GeneratedSop.entity';
import { IndustryClassification } from './entities/IndustryClassification.entity';
import { CashFlowEvent } from './entities/CashFlowEvent.entity';
import { Points } from './entities/Points.entity';
import { PointsRecord } from './entities/PointsRecord.entity';
import { ReferralCode } from './entities/ReferralCode.entity';
import { AssetService } from './services/AssetService';
import { CashFlowService } from './services/CashFlowService';
import { BusinessCashFlowService } from './services/BusinessCashFlowService';
import { SopExportService } from './services/SopExportService';
import { StrategyService } from './services/StrategyService';
import { EnterpriseStrategyService } from './services/EnterpriseStrategyService';
import { PortfolioMonitoringService } from './services/PortfolioMonitoringService';
import { PointsService } from './services/PointsService';
import { NSICoordinationService } from './services/NSICoordinationService';
import { AssetController } from './controllers/AssetController';
import { CashFlowController } from './controllers/CashFlowController';
import { BusinessCashFlowController } from './controllers/BusinessCashFlowController';
import { StrategyController } from './controllers/StrategyController';
import { EnterpriseStrategyController } from './controllers/EnterpriseStrategyController';
import { PortfolioMonitoringController } from './controllers/PortfolioMonitoringController';
import { PointsController } from './controllers/PointsController';
import { NSICoordinationController } from './controllers/NSICoordinationController';

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
      entities: [
        UserAssetAccount, CashFlowRecord, CashFlowForecast, 
        SopTemplate, GeneratedSop, IndustryClassification, CashFlowEvent,
        Points, PointsRecord, ReferralCode
      ],
      synchronize: true,
      logging: process.env.NODE_ENV !== 'production',
    }),
    TypeOrmModule.forFeature([UserAssetAccount, CashFlowRecord, CashFlowForecast, SopTemplate, GeneratedSop, IndustryClassification, CashFlowEvent, Points, PointsRecord, ReferralCode]),
  ],
  providers: [AssetService, CashFlowService, BusinessCashFlowService, SopExportService, StrategyService, EnterpriseStrategyService, PortfolioMonitoringService, PointsService, NSICoordinationService],
  controllers: [AssetController, CashFlowController, BusinessCashFlowController, StrategyController, EnterpriseStrategyController, PortfolioMonitoringController, PointsController, NSICoordinationController],
})
export class AppModule {}
