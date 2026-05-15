import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { News, NewsCategory, NewsSourceType } from '../entities/News.entity';

@Injectable()
export class NewsScheduler {
  private readonly logger = new Logger(NewsScheduler.name);

  constructor(
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
    private readonly http: HttpService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async fetchLatestNews() {
    this.logger.log('Fetching latest news from East Money...');
    try {
      const { data } = await firstValueFrom(
        this.http.get('http://nce-aktools:8080/api/public/stock_info_cjpl', { timeout: 15000 })
      );
      const items: any[] = Array.isArray(data) ? data : [];
      let added = 0;
      for (const item of items.slice(0, 10)) {
        const title = String(item['标题'] || item['title'] || '').trim();
        if (!title) continue;
        const exists = await this.newsRepository.findOne({ where: { title } });
        if (exists) continue;
        const news = this.newsRepository.create({
          title,
          summary: String(item['简介'] || item['summary'] || item['content'] || '').slice(0, 512),
          content: String(item['content'] || item['简介'] || item['summary'] || ''),
          category: NewsCategory.GENERAL,
          sourceType: NewsSourceType.OFFICIAL,
          sourceName: String(item['来源'] || item['source'] || 'East Money'),
          sourceUrl: String(item['url'] || item['link'] || item['sourceUrl'] || ''),
          author: String(item['作者'] || item['author'] || ''),
          publishTime: new Date(),
          isVerified: true,
          isLinkValid: false,
        });
        await this.newsRepository.save(news);
        added++;
      }
      this.logger.log(`News fetch complete: ${added} new articles`);
    } catch (err) {
      this.logger.warn(`News fetch failed: ${(err as Error).message}`);
    }
  }
}
