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
import { strategyApi, EnterpriseRiskProfile, EnterpriseProduct, EnterprisePortfolioMetrics, EnterpriseStrategyTemplate } from '@nce/shared/src/api/strategy';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface EnterpriseStrategyProps {
  navigateTo: (page: Page) => void;
}

const QUESTIONS = [
  { id: 'revenueScale', text: '企业年营收规模？', label: '营收规模',
    options: [
      { value: 'A', label: 'A. < 500万' },
      { value: 'B', label: 'B. 500万 - 2000万' },
      { value: 'C', label: 'C. > 2000万' },
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
  { id: 'industryRisk', text: '所处行业风险等级？', label: '行业风险',
    options: [
      { value: 'A', label: 'A. 低风险（如公用事业）' },
      { value: 'B', label: 'B. 中等风险（如制造业）' },
      { value: 'C', label: 'C. 高风险（如科技初创）' },
    ],
  },
  { id: 'emergencyFund', text: '企业是否设有应急储备金？', label: '应急储备',
    options: [
      { value: 'A', label: 'A. 是，充足' },
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

  const canProceed = () => Object.keys(answers).length === 7;

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
          background: currentStep >= step ? '#0066cc' : '#e0e0e0',
          transition: 'background 0.3s',
        }} />
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div>
      <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginTop: 0, marginBottom: '24px' }}>企业风险评估问卷</h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>请回答以下7个问题，我们将为企业推荐合适的投资策略。</p>
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
                    border: answers[question.id] === option.value ? '2px solid #0066cc' : '1px solid #ddd',
                    background: answers[question.id] === option.value ? '#e6f7ff' : 'white',
                    color: answers[question.id] === option.value ? '#0066cc' : '#333',
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
            padding: '12px 24px', border: '1px solid #ddd', borderRadius: '4px',
            background: 'white', cursor: 'pointer', color: '#666',
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
      {error && <p style={{ color: '#cc0000', textAlign: 'center', marginTop: '16px' }}>{error}</p>}
    </div>
  );

  const renderStep2 = () => (
    <div>
      <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{
            padding: '4px 12px', borderRadius: '12px',
            backgroundColor: riskProfile ? `${PROFILE_COLORS[riskProfile.profile]}20` : '#e6f7ff',
            color: riskProfile ? PROFILE_COLORS[riskProfile.profile] : '#0066cc',
            fontSize: '14px', fontWeight: '500',
          }}>
            得分: {riskProfile?.score}
          </span>
          <h2 style={{ margin: 0, color: riskProfile ? PROFILE_COLORS[riskProfile.profile] : '#333' }}>
            {riskProfile ? PROFILE_NAMES[riskProfile.profile] : ''}投资策略
          </h2>
        </div>
        <p style={{ color: '#666', marginBottom: '0' }}>
          根据企业问卷评估，推荐以下资产配置方案。
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          {getPieData() && <Pie data={getPieData()!} options={pieOptions} />}
        </div>
        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px' }}>配置明细</h3>
          {portfolioMetrics?.allocation && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(portfolioMetrics.allocation).map(([type, percentage]) => (
                <div key={type} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '8px',
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
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#0066cc' }}>{percentage}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {portfolioMetrics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <p style={{ color: '#666', margin: '0 0 8px', fontSize: '14px' }}>预期年化收益</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#00cc66', margin: 0 }}>{portfolioMetrics.expectedReturn}%</p>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <p style={{ color: '#666', margin: '0 0 8px', fontSize: '14px' }}>风险等级</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#cc6600', margin: 0 }}>{'⭐'.repeat(portfolioMetrics.riskLevel)}</p>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <p style={{ color: '#666', margin: '0 0 8px', fontSize: '14px' }}>流动性评分</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#0066cc', margin: 0 }}>{portfolioMetrics.liquidityScore}/100</p>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={() => { setCurrentStep(1); setAnswers({}); }} style={{
          padding: '12px 24px', border: '1px solid #ddd', borderRadius: '4px',
          background: 'white', cursor: 'pointer', color: '#666',
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
      <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
        <h2 style={{ marginTop: 0, marginBottom: '16px' }}>推荐产品</h2>
        <p style={{ color: '#666', marginBottom: 0 }}>根据企业的风险偏好，推荐以下产品：</p>
      </div>

      {products.length > 0 && (
        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
          <Bar data={getProductBarData()} options={barOptions} />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        {products.map((product) => (
          <div key={product.id} style={{
            background: 'white', padding: '20px', borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
            borderLeft: `4px solid ${product.riskLevel === 1 ? '#00cc66' : product.riskLevel === 2 ? '#0066cc' : '#cc6600'}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, marginBottom: '4px' }}>{product.name}</h3>
                <span style={{
                  display: 'inline-block', padding: '2px 8px', fontSize: '12px', borderRadius: '4px',
                  backgroundColor: '#f0f0f0', color: '#666', marginRight: '8px',
                }}>
                  流动性: {product.liquidityDays}天
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#00cc66' }}>{product.expectedReturn}%</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>预期年化收益</p>
              </div>
            </div>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{product.description}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={() => setCurrentStep(2)} style={{
          padding: '12px 24px', border: '1px solid #ddd', borderRadius: '4px',
          background: 'white', cursor: 'pointer', color: '#666',
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
      <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
        <h2 style={{ marginTop: 0, marginBottom: '16px' }}>策略模板详情</h2>
        <p style={{ color: '#666', marginBottom: 0 }}>选择适合企业的策略模板并参考执行指南。以下为所有可用模板：</p>
      </div>

      {templates.map((template) => (
        <div key={template.id} style={{
          background: 'white', padding: '24px', borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, color: '#0066cc' }}>{template.name}</h3>
            {(() => {
              const templateProfile = template.id.includes('CON') ? 'conservative' : template.id.includes('STA') ? 'stable' : 'aggressive';
              const isRecommended = riskProfile?.profile === templateProfile;
              return (
                <span style={{
                  padding: '2px 10px', borderRadius: '12px', fontSize: '12px',
                  backgroundColor: isRecommended ? '#e6f7ff' : '#f0f0f0',
                  color: isRecommended ? '#0066cc' : '#999',
                }}>
                  {isRecommended ? '✓ 推荐' : '可选'}
                </span>
              );
            })()}
          </div>
          <p style={{ color: '#666', margin: '0 0 8px', fontSize: '14px' }}>
            <strong>{template.description}</strong>
          </p>
          <p style={{ color: '#333', margin: '0 0 8px', fontSize: '14px' }}>
            <strong>适合对象：</strong>{template.suitableFor}
          </p>
          <p style={{ color: '#333', margin: '0 0 12px', fontSize: '14px' }}>
            <strong>执行指南：</strong>{template.executionGuide}
          </p>
          <div style={{
            background: '#f9f9f9', padding: '12px', borderRadius: '8px',
            display: 'flex', gap: '16px', justifyContent: 'space-around',
          }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '12px', color: '#666' }}>现金</span>
              <p style={{ margin: '4px 0 0', fontWeight: 'bold', color: '#00cc66' }}>{template.allocation.CASH}%</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '12px', color: '#666' }}>存款</span>
              <p style={{ margin: '4px 0 0', fontWeight: 'bold', color: '#0066cc' }}>{template.allocation.DEPOSIT}%</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '12px', color: '#666' }}>基金</span>
              <p style={{ margin: '4px 0 0', fontWeight: 'bold', color: '#cc6600' }}>{template.allocation.FUND}%</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '12px', color: '#666' }}>股票</span>
              <p style={{ margin: '4px 0 0', fontWeight: 'bold', color: '#cc0000' }}>{template.allocation.STOCK}%</p>
            </div>
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={() => setCurrentStep(3)} style={{
          padding: '12px 24px', border: '1px solid #ddd', borderRadius: '4px',
          background: 'white', cursor: 'pointer', color: '#666',
        }}>
          ← 返回产品列表
        </button>
        <button onClick={() => navigateTo('dashboard')} style={{
          padding: '12px 32px', borderRadius: '4px', border: 'none',
          background: '#0066cc', color: 'white', cursor: 'pointer', fontSize: '16px',
        }}>
          返回控制台
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigateTo('dashboard')}
          style={{
            background: 'white', border: '1px solid #ddd', borderRadius: '4px',
            padding: '8px 16px', cursor: 'pointer', color: '#666', marginBottom: '12px',
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
