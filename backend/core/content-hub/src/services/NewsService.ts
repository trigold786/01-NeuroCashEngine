import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { News, NewsCategory, NewsSourceType } from '../entities/News.entity';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
  ) {}

  async seedDemoData(): Promise<void> {
    const count = await this.newsRepository.count();
    if (count > 0) return;

    const demoNews = [
      {
        title: '央行宣布下调存款准备金率0.5个百分点',
        summary: '中国人民银行宣布降准，释放长期资金约1万亿元',
        content: '中国人民银行决定，自2026年5月15日起，下调金融机构存款准备金率0.5个百分点。本次降准将释放长期资金约1万亿元，保持流动性合理充裕，促进金融市场平稳运行。',
        category: NewsCategory.MACRO,
        sourceType: NewsSourceType.OFFICIAL,
        sourceName: '中国人民银行',
        isVerified: true,
      },
      {
        title: 'A股三大指数集体上涨，沪指收复3200点',
        summary: '今日A股强势上涨，沪指涨1.8%，深证成指涨2.2%',
        content: '今日A股市场迎来强势上涨，上证指数上涨1.8%，深证成指上涨2.2%，创业板指上涨2.5%。两市成交额突破1.2万亿元，北向资金净买入超80亿元。',
        category: NewsCategory.STOCK,
        sourceType: NewsSourceType.VERIFIED,
        sourceName: '财新',
        isVerified: true,
      },
      {
        title: '首批科创板做市商业务正式启动',
        summary: '上交所宣布科创板做市商业务正式启动',
        content: '上交所宣布，首批科创板做市商业务正式启动，做市商将为科创板股票提供流动性服务。首批做市商包括国泰君安、中信证券、海通证券等12家头部券商。',
        category: NewsCategory.STOCK,
        sourceType: NewsSourceType.OFFICIAL,
        sourceName: '上海证券交易所',
        isVerified: true,
      },
      {
        title: '货币基金收益率持续走高，平均7日年化超过3%',
        summary: '货币基金市场表现活跃，平均收益率创新高',
        content: '近期货币基金市场表现活跃，平均7日年化收益率已超过3%，创出年内新高。市场分析人士认为，这与流动性环境阶段性偏紧有关。',
        category: NewsCategory.FUND,
        sourceType: NewsSourceType.VERIFIED,
        sourceName: '雪球',
        isVerified: true,
      },
      {
        title: '十年期国债收益率波动上行',
        summary: '债券市场整体震荡，收益率小幅上行',
        content: '近期债券市场整体震荡，十年期国债收益率波动上行至2.8%，主要受基本面和政策面共同影响。',
        category: NewsCategory.BOND,
        sourceType: NewsSourceType.VERIFIED,
        sourceName: '华尔街见闻',
        isVerified: true,
      },
      {
        title: '国务院发布关于进一步促进资本市场健康发展的若干意见',
        summary: '官方发布重要政策意见，促进资本市场发展',
        content: '国务院发布关于进一步促进资本市场健康发展的若干意见，提出多项措施，包括完善股票发行注册制、加强投资者保护、推动扩大双向开放等。',
        category: NewsCategory.MACRO,
        sourceType: NewsSourceType.OFFICIAL,
        sourceName: '中国政府网',
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
    keyword?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ list: News[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.newsRepository.createQueryBuilder('news');

    if (category) {
      queryBuilder.where('news.category = :category', { category });
    }

    if (sourceType) {
      const cond = category ? 'andWhere' : 'where';
      queryBuilder[cond]('news.sourceType = :sourceType', { sourceType });
    }

    if (keyword) {
      const cond = category || sourceType ? 'andWhere' : 'where';
      queryBuilder[cond]('(news.title ILike :keyword OR news.summary ILike :keyword)', { 
        keyword: `%${keyword}%` 
      });
    }

    const [list, total] = await queryBuilder
      .orderBy('news.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { list, total, page, limit };
  }

  async getCategories(): Promise<{ key: NewsCategory; label: string }[]> {
    return [
      { key: NewsCategory.GENERAL, label: '综合' },
      { key: NewsCategory.STOCK, label: '股票' },
      { key: NewsCategory.FUND, label: '基金' },
      { key: NewsCategory.BOND, label: '债券' },
      { key: NewsCategory.MACRO, label: '宏观' },
    ];
  }

  async getNewsById(id: string): Promise<News> {
    const news = await this.newsRepository.findOne({ where: { id } });
    if (!news) throw new NotFoundException('News not found');

    await this.newsRepository.increment({ id }, 'viewCount', 1);
    return { ...news, viewCount: news.viewCount + 1 };
  }
}
