import { useState, useEffect } from 'react';
import { useAssetStore } from '@nce/shared';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Page } from '../App';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface AssetOverviewProps {
  navigateTo: (page: Page) => void;
}

const CHART_COLORS = ['#00cc66', '#0066cc', '#cc6600', '#cc0000'];

export default function AssetOverview({ navigateTo }: AssetOverviewProps) {
  const { overview, accounts, loading, error, fetchOverview, createAccount, deleteAccount } = useAssetStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [chartMode, setChartMode] = useState<'doughnut' | 'bar'>('doughnut');
  const [selectedTypeIndex, setSelectedTypeIndex] = useState<number | null>(null);
  const [newAccount, setNewAccount] = useState({
    accountType: 'CASH',
    accountName: '',
    balance: 0,
    currency: 'CNY',
    institutionCode: '',
    termYears: undefined as number | undefined,
    interestRate: undefined as number | undefined,
    startDate: '',
    endDate: '',
    fundCode: '',
    fundName: '',
    buyPrice: undefined as number | undefined,
    buyDate: '',
    shareCount: undefined as number | undefined,
    nav: undefined as number | undefined,
    stockCode: '',
    stockName: '',
    currentPrice: undefined as number | undefined,
    bondCode: '',
    bondName: '',
    bondType: '',
    maturityDate: '',
    couponRate: undefined as number | undefined,
    goldType: '',
    holdWeight: undefined as number | undefined,
    futuresCode: '',
    futuresName: '',
    margin: undefined as number | undefined,
    contractUnit: undefined as number | undefined,
    reitsCode: '',
    reitsName: '',
    dividendYield: undefined as number | undefined,
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
      institutionCode: '',
      termYears: undefined,
      interestRate: undefined,
      startDate: '',
      endDate: '',
      fundCode: '',
      fundName: '',
      buyPrice: undefined,
      buyDate: '',
      shareCount: undefined,
      nav: undefined,
      stockCode: '',
      stockName: '',
      currentPrice: undefined,
    bondCode: '',
    bondName: '',
    bondType: '',
    maturityDate: '',
    couponRate: undefined,
    goldType: '',
    holdWeight: undefined,
    futuresCode: '',
    futuresName: '',
    margin: undefined,
    contractUnit: undefined,
    reitsCode: '',
    reitsName: '',
    dividendYield: undefined,
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个账户吗？')) {
      await deleteAccount(id);
    }
  };

  const chartData = overview?.chartData || [];
  const colorsWithHighlight = CHART_COLORS.map((c, i) =>
    selectedTypeIndex !== null && i !== selectedTypeIndex ? c + '80' : c
  );

  const data = {
    labels: chartData.map(d => d.name),
    datasets: [
      {
        label: '资产分布',
        data: chartData.map(d => d.value),
        backgroundColor: chartMode === 'doughnut' ? colorsWithHighlight : CHART_COLORS,
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    onClick: (_event: any, elements: any[]) => {
      if (elements.length > 0) {
        setSelectedTypeIndex((prev) => (prev === elements[0].index ? null : elements[0].index));
      } else {
        setSelectedTypeIndex(null);
      }
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  const displayAccounts =
    selectedTypeIndex !== null && overview
      ? accounts.filter((acc: any) => acc.accountTypeName === overview.chartData[selectedTypeIndex]?.name)
      : accounts;

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
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={fetchOverview}
            disabled={loading}
            style={{
              padding: '10px 24px',
              backgroundColor: 'white',
              color: '#0066cc',
              border: '1px solid #0066cc',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            刷新
          </button>
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
                    {acc.accountType === 'DEPOSIT' && acc.termYears && (
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#999' }}>
                        {acc.termYears}年 | {acc.interestRate}% | {acc.startDate?.split('T')[0]} ~ {acc.endDate?.split('T')[0]}
                      </p>
                    )}
                    {acc.accountType === 'FUND' && acc.fundCode && (
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#999' }}>
                        {acc.fundCode} | {acc.fundName} | 持有{acc.shareCount}份 | 净值{acc.nav}
                      </p>
                    )}
                    {acc.accountType === 'STOCK' && acc.stockCode && (
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#999' }}>
                        {acc.stockCode} {acc.stockName} | 持仓{acc.shareCount}股 | 现价{acc.currentPrice}
                      </p>
                    )}
                    {acc.accountType === 'BOND' && acc.bondCode && (
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#999' }}>
                        {acc.bondCode} {acc.bondName} | {acc.bondType} | {acc.couponRate}% | 到期{acc.maturityDate?.split('T')[0]}
                      </p>
                    )}
                    {acc.accountType === 'GOLD' && acc.goldType && (
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#999' }}>
                        {acc.goldType} | 持有{acc.holdWeight}g
                      </p>
                    )}
                    {acc.accountType === 'FUTURES' && acc.futuresCode && (
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#999' }}>
                        {acc.futuresCode} {acc.futuresName} | 保证金{acc.margin} | 合约单位{acc.contractUnit}
                      </p>
                    )}
                    {acc.accountType === 'REITS' && acc.reitsCode && (
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#999' }}>
                        {acc.reitsCode} {acc.reitsName} | 分红收益率{acc.dividendYield}%
                      </p>
                    )}
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
                  <option value="BOND">债券</option>
                  <option value="GOLD">贵金属</option>
                  <option value="FUTURES">期货</option>
                  <option value="REITS">REITS</option>
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
                <label>机构代码 (选填)</label>
                <input
                  type="text"
                  value={newAccount.institutionCode}
                  onChange={(e) => setNewAccount({ ...newAccount, institutionCode: e.target.value })}
                  placeholder="例如：ICBC"
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

              {newAccount.accountType === 'DEPOSIT' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label>存款年限</label>
                    <input
                      type="number"
                      value={newAccount.termYears || ''}
                      onChange={(e) => setNewAccount({ ...newAccount, termYears: parseInt(e.target.value) || undefined })}
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label>利率 (%)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={newAccount.interestRate || ''}
                      onChange={(e) => setNewAccount({ ...newAccount, interestRate: parseFloat(e.target.value) || undefined })}
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label>存款起始日</label>
                    <input
                      type="date"
                      value={newAccount.startDate}
                      onChange={(e) => setNewAccount({ ...newAccount, startDate: e.target.value })}
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label>存款到期日</label>
                    <input
                      type="date"
                      value={newAccount.endDate}
                      onChange={(e) => setNewAccount({ ...newAccount, endDate: e.target.value })}
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>
                </>
              )}

              {newAccount.accountType === 'FUND' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label>基金代码</label>
                    <input
                      type="text"
                      value={newAccount.fundCode}
                      onChange={(e) => setNewAccount({ ...newAccount, fundCode: e.target.value })}
                      placeholder="例如：110022"
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label>基金名称</label>
                    <input
                      type="text"
                      value={newAccount.fundName}
                      onChange={(e) => setNewAccount({ ...newAccount, fundName: e.target.value })}
                      placeholder="例如：易方达消费行业股票"
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label>买入价</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={newAccount.buyPrice || ''}
                      onChange={(e) => setNewAccount({ ...newAccount, buyPrice: parseFloat(e.target.value) || undefined })}
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label>买入日期</label>
                    <input
                      type="date"
                      value={newAccount.buyDate}
                      onChange={(e) => setNewAccount({ ...newAccount, buyDate: e.target.value })}
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label>持有份额</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={newAccount.shareCount || ''}
                      onChange={(e) => setNewAccount({ ...newAccount, shareCount: parseFloat(e.target.value) || undefined })}
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label>基金净值</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={newAccount.nav || ''}
                      onChange={(e) => setNewAccount({ ...newAccount, nav: parseFloat(e.target.value) || undefined })}
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>
                </>
              )}

              {newAccount.accountType === 'BOND' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label>债券代码</label>
                    <input
                      type="text"
                      value={newAccount.bondCode}
                      onChange={(e) => setNewAccount({ ...newAccount, bondCode: e.target.value })}
                      placeholder="例如：019663"
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label>债券名称</label>
                    <input
                      type="text"
                      value={newAccount.bondName}
                      onChange={(e) => setNewAccount({ ...newAccount, bondName: e.target.value })}
                      placeholder="例如：21国债07"
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label>债券类型</label>
                    <select
                      value={newAccount.bondType}
                      onChange={(e) => setNewAccount({ ...newAccount, bondType: e.target.value })}
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                      <option value="">请选择</option>
                      <option value="国债">国债</option>
                      <option value="企业债">企业债</option>
                      <option value="可转债">可转债</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label>到期日</label>
                    <input
                      type="date"
                      value={newAccount.maturityDate}
                      onChange={(e) => setNewAccount({ ...newAccount, maturityDate: e.target.value })}
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label>票面利率 (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newAccount.couponRate || ''}
                      onChange={(e) => setNewAccount({ ...newAccount, couponRate: parseFloat(e.target.value) || undefined })}
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>
                </>
              )}

              {newAccount.accountType === 'GOLD' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label>黄金类型</label>
                    <select
                      value={newAccount.goldType}
                      onChange={(e) => setNewAccount({ ...newAccount, goldType: e.target.value })}
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                      <option value="">请选择</option>
                      <option value="黄金ETF">黄金ETF</option>
                      <option value="实物金">实物金</option>
                      <option value="纸黄金">纸黄金</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label>持有重量 (克)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newAccount.holdWeight || ''}
                      onChange={(e) => setNewAccount({ ...newAccount, holdWeight: parseFloat(e.target.value) || undefined })}
                      placeholder="例如：100"
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>
                </>
              )}

              {newAccount.accountType === 'FUTURES' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label>期货代码</label>
                    <input
                      type="text"
                      value={newAccount.futuresCode}
                      onChange={(e) => setNewAccount({ ...newAccount, futuresCode: e.target.value })}
                      placeholder="例如：IF2406"
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label>期货名称</label>
                    <input
                      type="text"
                      value={newAccount.futuresName}
                      onChange={(e) => setNewAccount({ ...newAccount, futuresName: e.target.value })}
                      placeholder="例如：沪深300股指期货"
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label>保证金</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newAccount.margin || ''}
                      onChange={(e) => setNewAccount({ ...newAccount, margin: parseFloat(e.target.value) || undefined })}
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label>合约单位</label>
                    <input
                      type="number"
                      step="1"
                      value={newAccount.contractUnit || ''}
                      onChange={(e) => setNewAccount({ ...newAccount, contractUnit: parseFloat(e.target.value) || undefined })}
                      placeholder="例如：300"
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>
                </>
              )}

              {newAccount.accountType === 'REITS' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label>REITS代码</label>
                    <input
                      type="text"
                      value={newAccount.reitsCode}
                      onChange={(e) => setNewAccount({ ...newAccount, reitsCode: e.target.value })}
                      placeholder="例如：508056"
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label>REITS名称</label>
                    <input
                      type="text"
                      value={newAccount.reitsName}
                      onChange={(e) => setNewAccount({ ...newAccount, reitsName: e.target.value })}
                      placeholder="例如：中金普洛斯REIT"
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label>分红收益率 (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newAccount.dividendYield || ''}
                      onChange={(e) => setNewAccount({ ...newAccount, dividendYield: parseFloat(e.target.value) || undefined })}
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>
                </>
              )}

              {newAccount.accountType === 'STOCK' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label>股票代码</label>
                    <input
                      type="text"
                      value={newAccount.stockCode}
                      onChange={(e) => setNewAccount({ ...newAccount, stockCode: e.target.value })}
                      placeholder="例如：600519"
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label>股票名称</label>
                    <input
                      type="text"
                      value={newAccount.stockName}
                      onChange={(e) => setNewAccount({ ...newAccount, stockName: e.target.value })}
                      placeholder="例如：贵州茅台"
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label>买入价</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newAccount.buyPrice || ''}
                      onChange={(e) => setNewAccount({ ...newAccount, buyPrice: parseFloat(e.target.value) || undefined })}
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label>买入日期</label>
                    <input
                      type="date"
                      value={newAccount.buyDate}
                      onChange={(e) => setNewAccount({ ...newAccount, buyDate: e.target.value })}
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label>持仓数量</label>
                    <input
                      type="number"
                      step="1"
                      value={newAccount.shareCount || ''}
                      onChange={(e) => setNewAccount({ ...newAccount, shareCount: parseFloat(e.target.value) || undefined })}
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label>当前股价</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newAccount.currentPrice || ''}
                      onChange={(e) => setNewAccount({ ...newAccount, currentPrice: parseFloat(e.target.value) || undefined })}
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>
                </>
              )}

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