import { useEffect } from 'react';
import { useBusinessStore, SopType } from '@nce/shared';
import { Page } from '../App';

interface BusinessSopListProps {
  navigateTo: (page: Page) => void;
  setCurrentSopId: (id: string) => void;
}

export default function BusinessSopList({ navigateTo, setCurrentSopId }: BusinessSopListProps) {
  const {
    sops,
    loading,
    error,
    fetchSops,
    generateSop,
    deleteSop,
  } = useBusinessStore();

  useEffect(() => {
    fetchSops();
  }, [fetchSops]);

  const handleViewSop = (id: string) => {
    setCurrentSopId(id);
    navigateTo('business-sop-detail');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <button
            onClick={() => navigateTo('dashboard')}
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
            ← 返回控制台
          </button>
          <h1 style={{ margin: 0 }}>SOP管理</h1>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => generateSop({ type: SopType.SHORTAGE })}
            disabled={loading}
            style={{
              padding: '10px 24px',
              backgroundColor: 'var(--semantic-red)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            生成短缺应对SOP
          </button>
          <button
            onClick={() => generateSop({ type: SopType.SURPLUS })}
            disabled={loading}
            style={{
              padding: '10px 24px',
              backgroundColor: 'var(--semantic-green)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            生成盈余增值SOP
          </button>
        </div>
      </div>

      {error && <p style={{ color: 'var(--semantic-red)', textAlign: 'center' }}>{error}</p>}

      {/* SOP列表 */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '8px',
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0 }}>SOP文档列表</h3>
        </div>
        <div style={{ padding: '0 20px' }}>
          {sops.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '40px 0' }}>
              暂无SOP文档，请点击上方按钮生成
            </p>
          ) : (
            <div style={{ padding: '16px 0' }}>
              {sops.map((sop) => (
                <div
                  key={sop.sopId}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 0',
                    borderBottom: '1px solid var(--border-color)'
                  }}
                >
                  <div
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleViewSop(sop.sopId)}
                  >
                    <p style={{ fontSize: '16px', marginBottom: '4px' }}>{sop.title}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                      创建时间：{new Date(sop.createdAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => handleViewSop(sop.sopId)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: 'var(--brand-blue)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      查看
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('确定要删除这个SOP吗？')) {
                          deleteSop(sop.sopId);
                        }
                      }}
                      style={{
                        padding: '6px 12px',
                        background: 'var(--bg-card)',
                        color: 'var(--semantic-red)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
