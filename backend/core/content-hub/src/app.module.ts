import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { News } from './entities/News.entity';
import { NewsService } from './services/NewsService';
import { NewsController } from './controllers/NewsController';

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
      entities: [News],
      synchronize: true, // 生产环境建议关闭
      logging: process.env.NODE_ENV !== 'production',
    }),
    TypeOrmModule.forFeature([News]),
  ],
  providers: [NewsService],
  controllers: [NewsController],
})
export class AppModule {}
