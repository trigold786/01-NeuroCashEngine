import React, { useEffect, useState } from 'react';
import { useNewsStore, NewsCategory, NewsSourceType, News } from '@nce/shared';

interface NewsListProps {
  navigateTo: (page: string) => void;
  setCurrentNewsId: (id: string) => void;
}

export default function NewsList({ navigateTo, setCurrentNewsId }: NewsListProps) {
  const { newsList, loading, error, fetchNewsList } = useNewsStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [keyword, setKeyword] = useState('');
  const [categories, setCategories] = useState<{ key: string; label: string }[]>([]);

  useEffect(() => {
    // 模拟获取分类数据
    setCategories([
      { key: '', label: '全部' },
      { key: NewsCategory.GENERAL, label: '综合' },
      { key: NewsCategory.STOCK, label: '股票' },
      { key: NewsCategory.FUND, label: '基金' },
      { key: NewsCategory.BOND, label: '债券' },
      { key: NewsCategory.MACRO, label: '宏观' },
    ]);
  }, []);

  useEffect(() => {
    const categoryValue = selectedCategory ? (selectedCategory as NewsCategory) : undefined;
    const sourceValue = selectedSource ? (selectedSource as NewsSourceType) : undefined;
    fetchNewsList({ category: categoryValue, sourceType: sourceValue, keyword: keyword || undefined });
  }, [fetchNewsList, selectedCategory, selectedSource, keyword]);

  const getSourceTypeLabel = (type: NewsSourceType): string => {
    return type === NewsSourceType.OFFICIAL ? '官方' : '已验证';
  };

  const handleNewsClick = (news: News) => {
    setCurrentNewsId(news.id);
    navigateTo('news-detail');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
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
            marginBottom: '12px'
          }}
        >
          ← 返回控制台
        </button>
        <h1 style={{ margin: '0 0 16px 0' }}>资讯中心</h1>

        {/* 筛选区 */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap' as const,
          gap: '12px',
          padding: '16px',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          {/* 搜索框 */}
          <div style={{ flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              placeholder="搜索资讯..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            />
          </div>

          {/* 分类筛选 */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '14px',
              minWidth: '120px'
            }}
          >
            {categories.map(cat => (
              <option key={cat.key} value={cat.key}>{cat.label}</option>
            ))}
          </select>

          {/* 来源筛选 */}
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '14px',
              minWidth: '120px'
            }}
          >
            <option value="">全部来源</option>
            <option value={NewsSourceType.OFFICIAL}>官方</option>
            <option value={NewsSourceType.VERIFIED}>已验证</option>
          </select>
        </div>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' as const }}>
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
                {categories.find(c => c.key === news.category)?.label || news.category}
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