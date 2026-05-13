import { useEffect } from 'react';
import { useBusinessStore } from '@nce/shared';
import { Page } from '../App';
import { businessApi } from '@nce/shared';

interface BusinessSopDetailProps {
  navigateTo: (page: Page) => void;
  sopId: string;
}

export default function BusinessSopDetail({ navigateTo, sopId }: BusinessSopDetailProps) {
  const {
    currentSop,
    loading,
    error,
    fetchSopById,
  } = useBusinessStore();

  useEffect(() => {
    fetchSopById(sopId);
  }, [fetchSopById, sopId]);

  const renderMarkdown = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} style={{ fontSize: '24px', margin: '16px 0 8px' }}>{line.slice(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index} style={{ fontSize: '20px', margin: '14px 0 6px' }}>{line.slice(3)}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={index} style={{ fontSize: '18px', margin: '12px 0 4px' }}>{line.slice(4)}</h3>;
      } else if (line.startsWith('- ')) {
        return <li key={index} style={{ margin: '4px 0', marginLeft: '20px' }}>{line.slice(2)}</li>;
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else {
        return <p key={index} style={{ margin: '8px 0' }}>{line}</p>;
      }
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <button
            onClick={() => navigateTo('business-sops')}
            style={{
background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              marginBottom: '8px'
            }}
          >
            ← 返回SOP列表
          </button>
        </div>
      </div>

      {loading && <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>加载中...</p>}
      {error && <p style={{ color: 'var(--semantic-red)', textAlign: 'center' }}>{error}</p>}

      {currentSop && (
        <div style={{
          background: 'white',
          padding: '32px',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <h1 style={{ marginTop: 0, marginBottom: '8px' }}>{currentSop.title}</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            创建时间：{new Date(currentSop.createdAt).toLocaleString('zh-CN')}
          </p>

          <div style={{ lineHeight: '1.6' }}>
            {renderMarkdown(currentSop.content)}
          </div>

          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
            <button
              style={{
                padding: '10px 24px',
                backgroundColor: '#0066cc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '12px'
              }}
              onClick={async () => {
                try {
                  const blob = await businessApi.exportPdf(sopId);
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `sop-${sopId}.html`;
                  a.click();
                  URL.revokeObjectURL(url);
                } catch (e) {
                  alert('导出失败');
                }
              }}
            >
              导出PDF
            </button>
            <button
              style={{
                padding: '10px 24px',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onClick={async () => {
                try {
                  const markdown = await businessApi.exportMarkdown(sopId);
                  await navigator.clipboard.writeText(markdown);
                  alert('已复制到剪贴板');
                } catch (e) {
                  alert('复制失败');
                }
              }}
            >
              复制内容
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
