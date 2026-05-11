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
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer',
              color: '#666',
              marginBottom: '8px'
            }}
          >
            ← 返回SOP列表
          </button>
        </div>
      </div>

      {loading && <p style={{ textAlign: 'center', color: '#666' }}>加载中...</p>}
      {error && <p style={{ color: '#cc0000', textAlign: 'center' }}>{error}</p>}

      {currentSop && (
        <div style={{
          background: 'white',
          padding: '32px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ marginTop: 0, marginBottom: '8px' }}>{currentSop.title}</h1>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            创建时间：{new Date(currentSop.createdAt).toLocaleString('zh-CN')}
          </p>

          <div style={{ lineHeight: '1.6' }}>
            {renderMarkdown(currentSop.content)}
          </div>

          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #eee' }}>
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
                backgroundColor: '#f5f5f5',
                color: '#333',
                border: '1px solid #ddd',
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
