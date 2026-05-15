import { useState } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Page } from '../App';
import { strategyApi, EnterpriseRiskProfile, EnterpriseProduct, EnterprisePortfolioMetrics, EnterpriseStrategyTemplate } from '@nce/shared';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface EnterpriseStrategyProps {
  navigateTo: (page: Page) => void;
}

const QUESTIONS = [
  { id: 'revenueScale', text: '企业年营收规模？', label: '营收规模',
    options: [
      { value: 'A', label: 'A. < 100万' },
      { value: 'B', label: 'B. 100万 - 500万' },
      { value: 'C', label: 'C. > 500万' },
    ],
  },
  { id: 'debtRatio', text: '企业负债率？', label: '负债率',
    options: [
      { value: 'A', label: 'A. < 30%' },
      { value: 'B', label: 'B. 30% - 60%' },
      { value: 'C', label: 'C. > 60%' },
    ],
  },
  { id: 'cashCycleDays', text: '企业现金周转周期？', label: '现金周转',
    options: [
      { value: 'A', label: 'A. < 30天' },
      { value: 'B', label: 'B. 30 - 60天' },
      { value: 'C', label: 'C. > 60天' },
    ],
  },
  { id: 'yearsInBusiness', text: '企业成立年限？', label: '成立年限',
    options: [
      { value: 'A', label: 'A. < 1年' },
      { value: 'B', label: 'B. 1 - 3年' },
      { value: 'C', label: 'C. > 3年' },
    ],
  },
  { id: 'industryRisk', text: '所属行业（参考GB/T 4754-2017）？', label: '行业分类',
    options: [
      { value: 'A', label: 'A. 低风险（F批发零售/居民服务）' },
      { value: 'B', label: 'B. 中等风险（C制造业/I信息技术）' },
      { value: 'C', label: 'C. 高风险（K房地产/M科研服务）' },
    ],
  },
  { id: 'emergencyFund', text: '企业是否设有应急储备金？', label: '应急储备',
    options: [
      { value: 'A', label: 'A. 是，可覆盖3月以上开支' },
      { value: 'B', label: 'B. 部分储备' },
      { value: 'C', label: 'C. 没有储备' },
    ],
  },
  { id: 'investmentExperience', text: '企业投资经验？', label: '投资经验',
    options: [
      { value: 'A', label: 'A. 无投资经验' },
      { value: 'B', label: 'B. 有一些经验' },
      { value: 'C', label: 'C. 经验丰富' },
    ],
  },
  { id: 'employeeCount', text: '企业员工人数？', label: '人员规模',
    options: [
      { value: 'A', label: 'A. 1-5人' },
      { value: 'B', label: 'B. 6-20人' },
      { value: 'C', label: 'C. >20人' },
    ],
  },
  { id: 'receivableRatio', text: '应收账款占总资产比例？', label: '应收占比',
    options: [
      { value: 'A', label: 'A. < 20%' },
      { value: 'B', label: 'B. 20% - 50%' },
      { value: 'C', label: 'C. > 50%' },
    ],
  },
  { id: 'taxCompliance', text: '企业税务合规状况？', label: '税务合规',
    options: [
      { value: 'A', label: 'A. 完全合规，按时申报' },
      { value: 'B', label: 'B. 基本合规，偶有延迟' },
      { value: 'C', label: 'C. 有欠税或处罚记录' },
    ],
  },
];

const PROFILE_NAMES: Record<string, string> = {
  conservative: '保守型',
  stable: '稳健型',
  aggressive: '进取型',
};

const PROFILE_COLORS: Record<string, string> = {
  conservative: '#00cc66',
  stable: '#0066cc',
  aggressive: '#cc6600',
};

export default function EnterpriseStrategy({ navigateTo }: EnterpriseStrategyProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [riskProfile, setRiskProfile] = useState<EnterpriseRiskProfile | null>(null);
  const [products, setProducts] = useState<EnterpriseProduct[]>([]);
  const [portfolioMetrics, setPortfolioMetrics] = useState<EnterprisePortfolioMetrics | null>(null);
  const [templates, setTemplates] = useState<EnterpriseStrategyTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const canProceed = () => Object.keys(answers).length === 10;

  const handleAssess = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await strategyApi.enterpriseAssessRisk(answers as any);
      setRiskProfile(result);
      const [productsData, portfolioData, templatesData] = await Promise.all([
        strategyApi.enterpriseGetProducts(result.profile),
        strategyApi.enterpriseGetPortfolio(result.profile),
        strategyApi.enterpriseGetTemplates(),
      ]);
      setProducts(productsData);
      setPortfolioMetrics(portfolioData);
      setTemplates(templatesData);
      setCurrentStep(2);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getPieData = () => {
    if (!portfolioMetrics) return null;
    const { allocation } = portfolioMetrics;
    return {
      labels: ['现金', '存款', '基金', '股票'],
      datasets: [{
        data: [allocation.CASH, allocation.DEPOSIT, allocation.FUND, allocation.STOCK],
        backgroundColor: ['#00cc66', '#0066cc', '#cc6600', '#cc0000'],
        borderWidth: 1,
      }],
    };
  };

  const getProductBarData = () => {
    return {
      labels: products.map(p => p.name),
      datasets: [{
        label: '预期年化收益 (%)',
        data: products.map(p => p.expectedReturn),
        backgroundColor: products.map(p => p.riskLevel === 1 ? '#00cc66' : p.riskLevel === 2 ? '#0066cc' : '#cc6600'),
      }],
    };
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' as const },
      title: { display: true, text: '推荐资产配置', font: { size: 16 } },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: '产品预期收益对比', font: { size: 16 } },
    },
    scales: {
      y: { beginAtZero: true, ticks: { callback: (v: any) => `${v}%` } },
    },
  };

  const renderStepIndicator = () => (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
      {[1, 2, 3, 4].map((step) => (
        <div key={step} style={{
          flex: 1, height: '4px', borderRadius: '2px',
          background: currentStep >= step ? 'var(--brand-blue)' : 'var(--border-color)',
          transition: 'background 0.3s',
        }} />
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div>
      <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginTop: 0, marginBottom: '24px' }}>企业风险评估问卷</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>请回答以下10个问题，我们将为企业推荐合适的投资策略。</p>
        {QUESTIONS.map((question, index) => (
          <div key={question.id} style={{ marginBottom: '24px' }}>
            <p style={{ fontWeight: '500', marginBottom: '12px' }}>{index + 1}. {question.text}</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' as const }}>
              {question.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswerChange(question.id, option.value)}
                  style={{
                    padding: '12px 24px', borderRadius: '8px',
                    border: answers[question.id] === option.value ? '2px solid #0066cc' : '1px solid var(--border-color)',
                    background: answers[question.id] === option.value ? '#e6f7ff' : 'white',
                    color: answers[question.id] === option.value ? 'var(--brand-blue)' : 'var(--text-primary)',
                    cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s',
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
          <button onClick={() => navigateTo('dashboard')} style={{
            padding: '12px 24px', border: '1px solid var(--border-color)', borderRadius: '4px',
            background: 'var(--bg-card)', cursor: 'pointer', color: 'var(--text-secondary)',
          }}>
            ← 返回
          </button>
          <button
            onClick={handleAssess}
            disabled={!canProceed() || loading}
            style={{
              padding: '12px 32px', borderRadius: '4px', border: 'none',
              background: canProceed() ? '#0066cc' : '#ccc', color: 'white',
              cursor: canProceed() ? 'pointer' : 'not-allowed', fontSize: '16px',
            }}
          >
            {loading ? '评估中...' : '查看推荐方案'}
          </button>
        </div>
      </div>
      {error && <p style={{ color: 'var(--semantic-red)', textAlign: 'center', marginTop: '16px' }}>{error}</p>}
    </div>
  );

  const renderStep2 = () => (
    <div>
      <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '8px', boxShadow: 'var(--shadow-card)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{
            padding: '4px 12px', borderRadius: '12px',
            backgroundColor: riskProfile ? `${PROFILE_COLORS[riskProfile.profile]}20` : '#e6f7ff',
            color: riskProfile ? PROFILE_COLORS[riskProfile.profile] : '#0066cc',
            fontSize: '14px', fontWeight: '500',
            border: '1px solid var(--brand-gold)',
          }}>
            得分: {riskProfile?.score}
          </span>
          <h2 style={{ margin: 0, color: riskProfile ? PROFILE_COLORS[riskProfile.profile] : 'var(--text-primary)' }}>
            {riskProfile ? PROFILE_NAMES[riskProfile.profile] : ''}投资策略
          </h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '0' }}>
          根据企业问卷评估，推荐以下资产配置方案。
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          {getPieData() && <Pie data={getPieData()!} options={pieOptions} />}
        </div>
        <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px' }}>配置明细</h3>
          {portfolioMetrics?.allocation && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(portfolioMetrics.allocation).map(([type, percentage]) => (
                <div key={type} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%',
                      backgroundColor: type === 'CASH' ? '#00cc66' : type === 'DEPOSIT' ? '#0066cc' : type === 'FUND' ? '#cc6600' : '#cc0000',
                    }} />
                    <span style={{ fontWeight: '500' }}>
                      {type === 'CASH' ? '现金' : type === 'DEPOSIT' ? '存款' : type === 'FUND' ? '基金' : '股票'}
                    </span>
                  </div>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--brand-blue)' }}>{percentage}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {portfolioMetrics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '8px', boxShadow: 'var(--shadow-card)', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', margin: '0 0 8px', fontSize: '14px' }}>预期年化收益</p>
            <p className="data-font" style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--semantic-green)', margin: 0 }}>{portfolioMetrics.expectedReturn}%</p>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '8px', boxShadow: 'var(--shadow-card)', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', margin: '0 0 8px', fontSize: '14px' }}>风险等级</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--brand-gold)', margin: 0 }}>{'⭐'.repeat(portfolioMetrics.riskLevel)}</p>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '8px', boxShadow: 'var(--shadow-card)', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', margin: '0 0 8px', fontSize: '14px' }}>流动性评分</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--brand-blue)', margin: 0 }}>{portfolioMetrics.liquidityScore}/100</p>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={() => { setCurrentStep(1); setAnswers({}); }} style={{
          padding: '12px 24px', border: '1px solid var(--border-color)', borderRadius: '4px',
          background: 'var(--bg-card)', cursor: 'pointer', color: 'var(--text-secondary)',
        }}>
          ← 重新评估
        </button>
        <button onClick={() => setCurrentStep(3)} style={{
          padding: '12px 32px', borderRadius: '4px', border: 'none',
          background: '#0066cc', color: 'white', cursor: 'pointer', fontSize: '16px',
        }}>
          查看推荐产品 →
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '8px', boxShadow: 'var(--shadow-card)', marginBottom: '24px' }}>
        <h2 style={{ marginTop: 0, marginBottom: '16px' }}>推荐产品</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 0 }}>根据企业的风险偏好，推荐以下产品：</p>
      </div>

      {products.length > 0 && (
        <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '8px', boxShadow: 'var(--shadow-card)', marginBottom: '24px' }}>
          <Bar data={getProductBarData()} options={barOptions} />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        {products.map((product) => (
          <div key={product.id} style={{
            background: 'var(--bg-card)', padding: '20px', borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
            borderLeft: `4px solid ${product.riskLevel === 1 ? '#00cc66' : product.riskLevel === 2 ? '#0066cc' : '#cc6600'}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, marginBottom: '4px' }}>{product.name}</h3>
                <span style={{
                  display: 'inline-block', padding: '2px 8px', fontSize: '12px', borderRadius: '4px',
                  backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', marginRight: '8px',
                }}>
                  流动性: {product.liquidityDays}天
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p className="data-font" style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: 'var(--semantic-green)' }}>{product.expectedReturn}%</p>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-tertiary)' }}>预期年化收益</p>
              </div>
            </div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>{product.description}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={() => setCurrentStep(2)} style={{
          padding: '12px 24px', border: '1px solid var(--border-color)', borderRadius: '4px',
          background: 'var(--bg-card)', cursor: 'pointer', color: 'var(--text-secondary)',
        }}>
          ← 返回配置方案
        </button>
        <button onClick={() => setCurrentStep(4)} style={{
          padding: '12px 32px', borderRadius: '4px', border: 'none',
          background: '#0066cc', color: 'white', cursor: 'pointer', fontSize: '16px',
        }}>
          查看策略详情 →
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div>
      <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '8px', boxShadow: 'var(--shadow-card)', marginBottom: '24px' }}>
        <h2 style={{ marginTop: 0, marginBottom: '16px' }}>策略模板详情</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 0 }}>选择适合企业的策略模板并参考执行指南。以下为所有可用模板：</p>
      </div>

      {templates.map((template) => (
        <div key={template.id} style={{
          background: 'var(--bg-card)', padding: '24px', borderRadius: '8px',
          boxShadow: 'var(--shadow-card)', marginBottom: '16px',
          borderLeft: (() => { const tp = template.id.includes('CON') ? 'conservative' : template.id.includes('STA') ? 'stable' : 'aggressive'; return riskProfile?.profile === tp ? '4px solid var(--brand-gold)' : 'none'; })(),
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, color: 'var(--brand-blue)' }}>{template.name}</h3>
            {(() => {
              const templateProfile = template.id.includes('CON') ? 'conservative' : template.id.includes('STA') ? 'stable' : 'aggressive';
              const isRecommended = riskProfile?.profile === templateProfile;
              return (
                <span style={{
                  padding: '2px 10px', borderRadius: '12px', fontSize: '12px',
                  backgroundColor: isRecommended ? '#fef7e0' : 'var(--bg-secondary)',
                  color: isRecommended ? 'var(--brand-gold)' : 'var(--text-tertiary)',
                  border: isRecommended ? '1px solid var(--brand-gold)' : 'none',
                }}>
                  {isRecommended ? '★ 推荐' : '可选'}
                </span>
              );
            })()}
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 8px', fontSize: '14px' }}>
            <strong>{template.description}</strong>
          </p>
          <p style={{ color: 'var(--text-primary)', margin: '0 0 8px', fontSize: '14px' }}>
            <strong>适合对象：</strong>{template.suitableFor}
          </p>
          <p style={{ color: 'var(--text-primary)', margin: '0 0 12px', fontSize: '14px' }}>
            <strong>执行指南：</strong>{template.executionGuide}
          </p>
          <div style={{
            background: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--radius-md)',
            display: 'flex', gap: '16px', justifyContent: 'space-around',
          }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>现金</span>
              <p style={{ margin: '4px 0 0', fontWeight: 'bold', color: 'var(--semantic-green)' }}>{template.allocation.CASH}%</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>存款</span>
              <p style={{ margin: '4px 0 0', fontWeight: 'bold', color: 'var(--brand-blue)' }}>{template.allocation.DEPOSIT}%</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>基金</span>
              <p style={{ margin: '4px 0 0', fontWeight: 'bold', color: 'var(--brand-gold)' }}>{template.allocation.FUND}%</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>股票</span>
              <p style={{ margin: '4px 0 0', fontWeight: 'bold', color: 'var(--semantic-red)' }}>{template.allocation.STOCK}%</p>
            </div>
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={() => setCurrentStep(3)} style={{
          padding: '12px 24px', border: '1px solid var(--border-color)', borderRadius: '4px',
          background: 'var(--bg-card)', cursor: 'pointer', color: 'var(--text-secondary)',
        }}>
          ← 返回产品列表
        </button>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigateTo('portfolio-monitoring')} style={{
            padding: '12px 24px', borderRadius: '4px', border: '1px solid #0066cc',
            background: 'var(--bg-card)', color: 'var(--brand-blue)', cursor: 'pointer', fontSize: '16px',
          }}>
            进入组合监控 →
          </button>
          <button onClick={() => navigateTo('dashboard')} style={{
            padding: '12px 32px', borderRadius: '4px', border: 'none',
            background: '#0066cc', color: 'white', cursor: 'pointer', fontSize: '16px',
          }}>
            返回控制台
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigateTo('dashboard')}
          style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '4px',
            padding: '8px 16px', cursor: 'pointer', color: 'var(--text-secondary)', marginBottom: '12px',
          }}
        >
          ← 返回控制台
        </button>
        <h1 style={{ margin: 0 }}>企业投资策略</h1>
      </div>

      {renderStepIndicator()}

      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
      {currentStep === 4 && renderStep4()}
    </div>
  );
}
