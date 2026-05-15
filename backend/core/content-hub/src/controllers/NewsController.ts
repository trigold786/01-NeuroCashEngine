import { Controller, Get, Param, Query, Post, OnModuleInit, Logger } from '@nestjs/common';
import { NewsService } from '../services/NewsService';
import { NewsCategory, NewsSourceType } from '../entities/News.entity';

@Controller('news')
export class NewsController implements OnModuleInit {
  private readonly logger = new Logger(NewsController.name);

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

  @Post('validate-links')
  async validateLinks() {
    const result = await this.newsService.validateAllLinks();
    this.logger.log(`Manual link validation triggered: ${JSON.stringify(result)}`);
    return result;
  }

  @Get(':id')
  async getNews(@Param('id') id: string) {
    return await this.newsService.getNewsById(id);
  }
}
