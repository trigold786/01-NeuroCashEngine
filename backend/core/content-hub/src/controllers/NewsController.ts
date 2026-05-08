import { Controller, Get, Param, Query, OnModuleInit } from '@nestjs/common';
import { NewsService } from '../services/NewsService';
import { NewsCategory, NewsSourceType } from '../entities/News.entity';

@Controller('news')
export class NewsController implements OnModuleInit {
  constructor(private readonly newsService: NewsService) {}

  async onModuleInit() {
    // 应用启动时自动初始化demo数据
    await this.newsService.seedDemoData();
  }

  @Get()
  async getNewsList(
    @Query('category') category?: NewsCategory,
    @Query('sourceType') sourceType?: NewsSourceType,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return await this.newsService.getNewsList(
      category,
      sourceType,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get(':id')
  async getNews(@Param('id') id: string) {
    return await this.newsService.getNewsById(id);
  }
}
