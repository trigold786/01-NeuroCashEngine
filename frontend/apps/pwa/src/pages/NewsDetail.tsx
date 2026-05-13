import { useEffect } from 'react';
import { useNewsStore, NewsCategory, NewsSourceType } from '@nce/shared';
import { Page } from '../App';

interface NewsDetailProps {
  navigateTo: (page: Page) => void;
  newsId: string;
}

export default function NewsDetail({ navigateTo, newsId }: NewsDetailProps) {
  const { currentNews, loading, error, fetchNewsById, clearCurrentNews } = useNewsStore();

  useEffect(() => {
    fetchNewsById(newsId);

    return () => {
      clearCurrentNews();
    };
  }, [newsId, fetchNewsById, clearCurrentNews]);

  const getSourceTypeLabel = (type: NewsSourceType) => {
    return type === NewsSourceType.OFFICIAL ? '官方' : '已验证';
  };

  const getCategoryLabel = (category: NewsCategory) => {
    const labels: Record<NewsCategory, string> = {
      [NewsCategory.GENERAL]: '综合',
      [NewsCategory.STOCK]: '股票',
      [NewsCategory.FUND]: '基金',
      [NewsCategory.BOND]: '债券',
      [NewsCategory.MACRO]: '宏观',
    };
    return labels[category];
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigateTo('news')}
          style={{
background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            padding: '8px 16px',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
          }}
        >
          ← 返回资讯列表
        </button>
      </div>

      {loading && <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>加载中...</p>}
      {error && <p style={{ color: 'var(--semantic-red)', textAlign: 'center' }}>{error}</p>}

      {currentNews && (
        <div style={{
          background: 'white',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-card)',
          padding: '32px',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span
              style={{
                padding: '2px 8px',
                fontSize: '12px',
                borderRadius: '12px',
                backgroundColor: currentNews.sourceType === NewsSourceType.OFFICIAL ? '#e6f7ff' : '#f6ffed',
                color: currentNews.sourceType === NewsSourceType.OFFICIAL ? 'var(--brand-blue)' : 'var(--semantic-green)'
              }}
            >
              {getSourceTypeLabel(currentNews.sourceType)}
            </span>
            <span style={{
              padding: '2px 8px',
              fontSize: '12px',
              borderRadius: '12px',
              backgroundColor: '#fff7e6',
              color: 'var(--brand-gold)',
            }}>
              {currentNews.sourceType === NewsSourceType.OFFICIAL ? '来源: 官方渠道' : '来源: 已验证渠道'}
            </span>
            <span
              style={{
                padding: '2px 8px',
                fontSize: '12px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-secondary)',
color: 'var(--text-secondary)'
              }}
            >
              {getCategoryLabel(currentNews.category)}
            </span>
          </div>

          <h1 style={{ fontSize: '28px', marginBottom: '16px' }}>{currentNews.title}</h1>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            color: 'var(--text-tertiary)',
            fontSize: '14px',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--border-color)',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <span>来源：{currentNews.sourceName}{currentNews.author ? ` | 作者：${currentNews.author}` : ''}{currentNews.publishTime ? ` | 发布时间：${new Date(currentNews.publishTime).toLocaleString('zh-CN')}` : ''}</span>
            {currentNews.sourceUrl && <a href={currentNews.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-blue)' }}>查看原文 →</a>}
            <span>阅读：{currentNews.viewCount}</span>
          </div>

          <div style={{ fontSize: '16px', lineHeight: '1.8', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
            {currentNews.content}
          </div>
        </div>
      )}
    </div>
  );
}
