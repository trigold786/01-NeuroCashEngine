import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News, NewsCategory, NewsSourceType } from '../entities/News.entity';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
  ) {}

  // 初始化一些demo数据
  async seedDemoData(): Promise<void> {
    const count = await this.newsRepository.count();
    if (count > 0) return;

    const demoNews = [
      {
        title: '央行宣布下调存款准备金率0.5个百分点',
        content: '中国人民银行决定，自2026年5月15日起，下调金融机构存款准备金率0.5个百分点。',
        category: NewsCategory.MACRO,
        sourceType: NewsSourceType.OFFICIAL,
        sourceName: '中国人民银行',
        isVerified: true,
      },
      {
        title: 'A股三大指数集体上涨，沪指收复3200点',
        content: '今日A股市场迎来强势上涨，上证指数上涨1.8%，深证成指上涨2.2%，创业板指上涨2.5%。',
        category: NewsCategory.STOCK,
        sourceType: NewsSourceType.VERIFIED,
        sourceName: '财联社',
        isVerified: true,
      },
      {
        title: '首批科创板做市商业务正式启动',
        content: '上交所宣布，首批科创板做市商业务正式启动，做市商将为科创板股票提供流动性服务。',
        category: NewsCategory.STOCK,
        sourceType: NewsSourceType.OFFICIAL,
        sourceName: '上海证券交易所',
        isVerified: true,
      },
      {
        title: '货币基金收益率持续走高，平均7日年化超过3%',
        content: '近期货币基金市场表现活跃，平均7日年化收益率已超过3%，创出年内新高。',
        category: NewsCategory.FUND,
        sourceType: NewsSourceType.VERIFIED,
        sourceName: '雪球',
        isVerified: true,
      },
    ];

    for (const news of demoNews) {
      const n = this.newsRepository.create(news);
      await this.newsRepository.save(n);
    }
  }

  async getNewsList(
    category?: NewsCategory,
    sourceType?: NewsSourceType,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ list: News[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.newsRepository.createQueryBuilder('news');

    if (category) {
      queryBuilder.where('news.category = :category', { category });
    }

    if (sourceType) {
      queryBuilder.andWhere('news.sourceType = :sourceType', { sourceType });
    }

    const [list, total] = await queryBuilder
      .orderBy('news.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { list, total, page, limit };
  }

  async getNewsById(id: string): Promise<News> {
    const news = await this.newsRepository.findOne({ where: { id } });
    if (!news) throw new NotFoundException('News not found');

    // 增加阅读量
    await this.newsRepository.increment({ id }, 'viewCount', 1);
    return { ...news, viewCount: news.viewCount + 1 };
  }
}
