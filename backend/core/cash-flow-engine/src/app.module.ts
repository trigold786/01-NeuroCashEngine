import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { UserAssetAccount } from './entities/UserAssetAccount.entity';
import { CashFlowRecord } from './entities/CashFlowRecord.entity';
import { InvestmentProduct } from './entities/InvestmentProduct.entity';
import { CashFlowForecast } from './entities/CashFlowForecast.entity';
import { SopTemplate } from './entities/SopTemplate.entity';
import { GeneratedSop } from './entities/GeneratedSop.entity';
import { IndustryClassification } from './entities/IndustryClassification.entity';
import { CashFlowEvent } from './entities/CashFlowEvent.entity';
import { Points } from './entities/Points.entity';
import { PointsRecord } from './entities/PointsRecord.entity';
import { ReferralCode } from './entities/ReferralCode.entity';
import { Notification } from './entities/Notification.entity';
import { SystemConfig } from './entities/SystemConfig.entity';
import { FileRecord } from './entities/FileRecord.entity';
import { Subscription } from './entities/Subscription.entity';
import { AssetService } from './services/AssetService';
import { CashFlowService } from './services/CashFlowService';
import { CashFlowRecordService } from './services/CashFlowRecordService';
import { InvestmentProductService } from './services/InvestmentProductService';
import { BusinessCashFlowService } from './services/BusinessCashFlowService';
import { SopExportService } from './services/SopExportService';
import { StrategyService } from './services/StrategyService';
import { EnterpriseStrategyService } from './services/EnterpriseStrategyService';
import { PortfolioMonitoringService } from './services/PortfolioMonitoringService';
import { PointsService } from './services/PointsService';
import { NSICoordinationService } from './services/NSICoordinationService';
import { SchedulerService } from './services/SchedulerService';
import { NotificationService } from './services/NotificationService';
import { ConfigService } from './services/ConfigService';
import { FileStorageService } from './services/FileStorageService';
import { SubscriptionService } from './services/SubscriptionService';
import { PermissionGuard } from './guards/PermissionGuard.guard';
import { AssetController } from './controllers/AssetController';
import { CashFlowController } from './controllers/CashFlowController';
import { InvestmentProductController } from './controllers/InvestmentProductController';
import { BusinessCashFlowController } from './controllers/BusinessCashFlowController';
import { StrategyController } from './controllers/StrategyController';
import { EnterpriseStrategyController } from './controllers/EnterpriseStrategyController';
import { PortfolioMonitoringController } from './controllers/PortfolioMonitoringController';
import { PointsController } from './controllers/PointsController';
import { NSICoordinationController } from './controllers/NSICoordinationController';
import { NotificationController } from './controllers/NotificationController';
import { ConfigController } from './controllers/ConfigController';
import { FileStorageController } from './controllers/FileStorageController';
import { SubscriptionController } from './controllers/SubscriptionController';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MulterModule.register({ dest: './uploads' }),
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
        Points, PointsRecord, ReferralCode,
        Notification, SystemConfig, FileRecord, Subscription, InvestmentProduct,
      ],
      synchronize: true,
      logging: process.env.NODE_ENV !== 'production',
    }),
    TypeOrmModule.forFeature([UserAssetAccount, CashFlowRecord, CashFlowForecast, SopTemplate, GeneratedSop, IndustryClassification, CashFlowEvent, Points, PointsRecord, ReferralCode, Notification, SystemConfig, FileRecord, Subscription, InvestmentProduct]),
  ],
  providers: [AssetService, CashFlowService, CashFlowRecordService, InvestmentProductService, BusinessCashFlowService, SopExportService, StrategyService, EnterpriseStrategyService, PortfolioMonitoringService, PointsService, NSICoordinationService, NotificationService, ConfigService, FileStorageService, SubscriptionService],
  controllers: [AssetController, CashFlowController, InvestmentProductController, BusinessCashFlowController, StrategyController, EnterpriseStrategyController, PortfolioMonitoringController, PointsController, NSICoordinationController, NotificationController, ConfigController, FileStorageController, SubscriptionController],
})
export class AppModule {}
