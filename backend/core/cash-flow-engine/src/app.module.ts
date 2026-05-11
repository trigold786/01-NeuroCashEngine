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
import { AssetService } from './services/AssetService';
import { CashFlowService } from './services/CashFlowService';
import { BusinessCashFlowService } from './services/BusinessCashFlowService';
import { AssetController } from './controllers/AssetController';
import { CashFlowController } from './controllers/CashFlowController';
import { BusinessCashFlowController } from './controllers/BusinessCashFlowController';

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
        SopTemplate, GeneratedSop, IndustryClassification, CashFlowEvent
      ],
      synchronize: true,
      logging: process.env.NODE_ENV !== 'production',
    }),
    TypeOrmModule.forFeature([UserAssetAccount, CashFlowRecord, CashFlowForecast, SopTemplate, GeneratedSop, IndustryClassification, CashFlowEvent]),
  ],
  providers: [AssetService, CashFlowService, BusinessCashFlowService],
  controllers: [AssetController, CashFlowController, BusinessCashFlowController],
})
export class AppModule {}
