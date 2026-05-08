import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserAssetAccount } from './entities/UserAssetAccount.entity';
import { CashFlowRecord } from './entities/CashFlowRecord.entity';
import { AssetService } from './services/AssetService';
import { CashFlowService } from './services/CashFlowService';
import { AssetController } from './controllers/AssetController';
import { CashFlowController } from './controllers/CashFlowController';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'nce_root_123',
      database: process.env.DB_NAME || 'nce_db',
      entities: [UserAssetAccount, CashFlowRecord],
      synchronize: true, // 生产环境建议关闭
      logging: process.env.NODE_ENV !== 'production',
    }),
    TypeOrmModule.forFeature([UserAssetAccount, CashFlowRecord]),
  ],
  providers: [AssetService, CashFlowService],
  controllers: [AssetController, CashFlowController],
})
export class AppModule {}
