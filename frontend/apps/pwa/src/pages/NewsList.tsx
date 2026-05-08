import React, { useEffect } from 'react';
import { useNewsStore, NewsCategory, NewsSourceType, News } from '@nce/shared';

interface NewsListProps {
  navigateTo: (page: string) => void;
  setCurrentNewsId: (id: string) => void;
}

export default function NewsList({ navigateTo, setCurrentNewsId }: NewsListProps) {
  const { newsList, loading, error, fetchNewsList } = useNewsStore();

  useEffect(() => {
    fetchNewsList();
  }, [fetchNewsList]);

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

  const handleNewsClick = (news: News) => {
    setCurrentNewsId(news.id);
    navigateTo('news-detail');
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigateTo('dashboard')}
          style={{
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '8px 16px',
            cursor: 'pointer',
            color: '#666',
            marginBottom: '8px'
          }}
        >
          ← 返回控制台
        </button>
        <h1>资讯中心</h1>
      </div>

      {loading && <p style={{ textAlign: 'center', color: '#666' }}>加载中...</p>}
      {error && <p style={{ color: '#cc0000', textAlign: 'center' }}>{error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {newsList.map((news) => (
          <div
            key={news.id}
            style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onClick={() => handleNewsClick(news)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span
                style={{
                  padding: '2px 8px',
                  fontSize: '12px',
                  borderRadius: '12px',
                  backgroundColor: news.sourceType === NewsSourceType.OFFICIAL ? '#e6f7ff' : '#f6ffed',
                  color: news.sourceType === NewsSourceType.OFFICIAL ? '#0066cc' : '#00cc66'
                }}
              >
                {getSourceTypeLabel(news.sourceType)}
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
                {getCategoryLabel(news.category)}
              </span>
            </div>

            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{news.title}</h3>

            {news.summary && (
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '12px' }}>{news.summary}</p>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999', fontSize: '12px' }}>
              <span>{news.sourceName}</span>
              <span>{news.viewCount} 阅读</span>
            </div>
          </div>
        ))}
      </div>

      {!loading && newsList.length === 0 && (
        <p style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
          暂无资讯
        </p>
      )}
    </div>
  );
}
