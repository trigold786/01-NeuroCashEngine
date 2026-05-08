import { useState, useEffect } from 'react';
import { useAssetStore } from '@nce/shared';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Page } from '../App';

ChartJS.register(ArcElement, Tooltip, Legend);

interface AssetOverviewProps {
  navigateTo: (page: Page) => void;
}

const CHART_COLORS = ['#00cc66', '#0066cc', '#cc6600', '#cc0000'];

export default function AssetOverview({ navigateTo }: AssetOverviewProps) {
  const { overview, accounts, loading, error, fetchOverview, createAccount, deleteAccount } = useAssetStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAccount, setNewAccount] = useState({
    accountType: 'CASH',
    accountName: '',
    balance: 0,
    currency: 'CNY',
  });

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAccount(newAccount);
    setShowAddModal(false);
    setNewAccount({
      accountType: 'CASH',
      accountName: '',
      balance: 0,
      currency: 'CNY',
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个账户吗？')) {
      await deleteAccount(id);
    }
  };

  const chartData = overview?.chartData || [];
  const data = {
    labels: chartData.map(d => d.name),
    datasets: [
      {
        label: '资产分布',
        data: chartData.map(d => d.value),
        backgroundColor: CHART_COLORS,
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap' as const,
        gap: '12px'
      }}>
        <div>
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
          <h1 style={{ margin: 0 }}>资产概览</h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            padding: '10px 24px',
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          + 添加账户
        </button>
      </div>

      {loading && <p style={{ textAlign: 'center', color: '#666' }}>加载中...</p>}
      {error && <p style={{ color: '#cc0000', textAlign: 'center' }}>{error}</p>}

      {overview && (
        <>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            marginBottom: '24px'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '16px' }}>总资产</h2>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#0066cc', margin: 0 }}>
              ¥{overview.total.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            }}>
              <h3 style={{ marginTop: 0 }}>资产配置</h3>
              {chartData.length > 0 ? (
                <div style={{ maxHeight: '300px' }}>
                  <Doughnut data={data} options={options} />
                </div>
              ) : (
                <p style={{ color: '#999', textAlign: 'center' }}>暂无资产数据</p>
              )}
            </div>

            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            }}>
              <h3 style={{ marginTop: 0 }}>资产明细</h3>
              {chartData.map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                    <div>
                      <p style={{ margin: 0, fontWeight: '500' }}>{item.name}</p>
                      <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>{item.percentage}%</p>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>
                    ¥{item.value.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 账户列表 */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #eee' }}>
          <h3 style={{ margin: 0 }}>账户列表</h3>
        </div>
        <div style={{ padding: '0 20px' }}>
          {accounts.length === 0 ? (
            <p style={{ padding: '40px 0', textAlign: 'center', color: '#999' }}>
              暂无账户，点击上方“添加账户”开始
            </p>
          ) : (
            <div style={{ padding: '16px 0' }}>
              {accounts.map((acc: any) => (
                <div
                  key={acc.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 0',
                    borderBottom: '1px solid #eee'
                  }}
                >
                  <div>
                    <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '4px' }}>
                      {acc.accountName || acc.accountTypeName}
                    </p>
                    <p style={{ margin: 0, color: '#666' }}>{acc.accountTypeName}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#00cc66', margin: 0 }}>
                      ¥{acc.balance.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                    </p>
                    <button
                      onClick={() => handleDelete(acc.id)}
                      style={{
                        background: '#fff5f5',
                        color: '#cc0000',
                        border: '1px solid #ffcccc',
                        borderRadius: '4px',
                        padding: '6px 12px',
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

      {/* 添加账户模态框 */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            width: '100%',
            maxWidth: '480px',
            borderRadius: '8px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>添加账户</h2>
              <button onClick={() => setShowAddModal(false)} style={{ fontSize: '24px', border: 'none', background: 'none', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleSubmitAdd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label>账户类型</label>
                <select
                  value={newAccount.accountType}
                  onChange={(e) => setNewAccount({ ...newAccount, accountType: e.target.value })}
                  style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                  <option value="CASH">现金</option>
                  <option value="DEPOSIT">存款</option>
                  <option value="FUND">基金</option>
                  <option value="STOCK">股票</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label>账户名称 (选填)</label>
                <input
                  type="text"
                  value={newAccount.accountName}
                  onChange={(e) => setNewAccount({ ...newAccount, accountName: e.target.value })}
                  placeholder="例如：建设银行储蓄卡"
                  style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label>余额</label>
                <input
                  type="number"
                  step="0.01"
                  value={newAccount.balance}
                  onChange={(e) => setNewAccount({ ...newAccount, balance: parseFloat(e.target.value) || 0 })}
                  required
                  style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '10px 24px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#0066cc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {loading ? '添加中...' : '添加账户'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}