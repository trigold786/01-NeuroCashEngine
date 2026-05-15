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
    this.logger.log('Fetching latest news from Sina Finance...');
    try {
      const { data } = await firstValueFrom(
        this.http.get('https://feed.mix.sina.com.cn/api/roll/get', {
          params: { pageid: 153, lid: 2516, k: '', num: 10 },
          headers: { 'User-Agent': 'Mozilla/5.0' },
          timeout: 15000,
        })
      );
      const items: any[] = data?.result?.data || [];
      let added = 0;
      for (const item of items) {
        const title = String(item['title'] || '').trim();
        if (!title) continue;
        const exists = await this.newsRepository.findOne({ where: { title } });
        if (exists) continue;
        const url = String(item['url'] || '');
        const news = this.newsRepository.create({
          title,
          summary: title,
          content: title,
          category: NewsCategory.GENERAL,
          sourceType: NewsSourceType.VERIFIED,
          sourceName: '新浪财经',
          sourceUrl: url,
          author: '新浪财经',
          publishTime: new Date(parseInt(String(item['ctime'] || '0')) * 1000),
          isVerified: true,
          isLinkValid: url.startsWith('http'),
        });
        await this.newsRepository.save(news);
        added++;
      }
      this.logger.log(`News fetch complete: ${added} new articles from Sina`);
    } catch (err) {
      this.logger.warn(`News fetch failed: ${(err as Error).message}`);
    }
  }
}
