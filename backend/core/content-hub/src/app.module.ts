import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { News } from './entities/News.entity';
import { NewsService } from './services/NewsService';
import { NewsController } from './controllers/NewsController';
import { NewsScheduler } from './services/NewsScheduler';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432') || 5432,
      username: process.env.DB_USER || 'nce_root',
      password: process.env.DB_PASSWORD || 'nce_root_123',
      database: process.env.DB_NAME || 'nce_db',
      entities: [News],
      synchronize: true,
      logging: process.env.NODE_ENV !== 'production',
    }),
    TypeOrmModule.forFeature([News]),
  ],
  providers: [NewsService, NewsScheduler],
  controllers: [NewsController],
})
export class AppModule {}
