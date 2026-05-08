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
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '8px 16px',
            cursor: 'pointer',
            color: '#666',
          }}
        >
          ← 返回资讯列表
        </button>
      </div>

      {loading && <p style={{ textAlign: 'center', color: '#666' }}>加载中...</p>}
      {error && <p style={{ color: '#cc0000', textAlign: 'center' }}>{error}</p>}

      {currentNews && (
        <div style={{
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          padding: '32px',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span
              style={{
                padding: '2px 8px',
                fontSize: '12px',
                borderRadius: '12px',
                backgroundColor: currentNews.sourceType === NewsSourceType.OFFICIAL ? '#e6f7ff' : '#f6ffed',
                color: currentNews.sourceType === NewsSourceType.OFFICIAL ? '#0066cc' : '#00cc66'
              }}
            >
              {getSourceTypeLabel(currentNews.sourceType)}
            </span>
            <span
              style={{
                padding: '2px 8px',
                fontSize: '12px',
                borderRadius: '12px',
                backgroundColor: '#f5f5f5',
                color: '#666'
              }}
            >
              {getCategoryLabel(currentNews.category)}
            </span>
          </div>

          <h1 style={{ fontSize: '28px', marginBottom: '16px' }}>{currentNews.title}</h1>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            color: '#999',
            fontSize: '14px',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1px solid #eee'
          }}>
            <span>来源：{currentNews.sourceName}</span>
            <span>阅读：{currentNews.viewCount}</span>
          </div>

          <div style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', whiteSpace: 'pre-wrap' }}>
            {currentNews.content}
          </div>
        </div>
      )}
    </div>
  );
}
