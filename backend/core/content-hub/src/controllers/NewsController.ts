import { Controller, Get, Param, Query, OnModuleInit } from '@nestjs/common';
import { NewsService } from '../services/NewsService';
import { NewsCategory, NewsSourceType } from '../entities/News.entity';

@Controller('news')
export class NewsController implements OnModuleInit {
  constructor(private readonly newsService: NewsService) {}

  async onModuleInit() {
    await this.newsService.seedDemoData();
  }

  @Get('categories')
  async getCategories() {
    return await this.newsService.getCategories();
  }

  @Get()
  async getNewsList(
    @Query('category') category?: NewsCategory,
    @Query('sourceType') sourceType?: NewsSourceType,
    @Query('keyword') keyword?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return await this.newsService.getNewsList(
      category,
      sourceType,
      keyword,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get(':id')
  async getNews(@Param('id') id: string) {
    return await this.newsService.getNewsById(id);
  }
}
