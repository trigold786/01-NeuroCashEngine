import { useState, useMemo } from 'react';
import { Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  RadarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Page } from '../App';
import { strategyApi, Product, Recommendation, InvestmentStrategy, FundamentalAnalysis, TechnicalAnalysis } from '@nce/shared/src/api/strategy';
import { CardSkeleton, StepSkeleton } from '../components/LoadingSkeleton';

ChartJS.register(CategoryScale, LinearScale, BarElement, RadialLinearScale, PointElement, RadarElement, Title, Tooltip, Legend);

interface StrategyProps {
  navigateTo: (page: Page) => void;
}

const QUESTIONS = [
  {
    id: 'q1',
    text: '您的年龄范围？',
    options: [
      { value: 'A', label: 'A. <30岁' },
      { value: 'B', label: 'B. 30-50岁' },
      { value: 'C', label: 'C. >50岁' },
    ],
  },
  {
    id: 'q2',
    text: '您的投资经验？',
    options: [
      { value: 'A', label: 'A. 无' },
      { value: 'B', label: 'B. 1-3年' },
      { value: 'C', label: 'C. >3年' },
    ],
  },
  {
    id: 'q3',
    text: '您能承受的最大亏损？',
    options: [
      { value: 'A', label: 'A. 5%' },
      { value: 'B', label: 'B. 10%' },
      { value: 'C', label: 'C. 20%' },
    ],
  },
  {
    id: 'q4',
    text: '您的投资期限？',
    options: [
      { value: 'A', label: 'A. <1年' },
      { value: 'B', label: 'B. 1-3年' },
      { value: 'C', label: 'C. >3年' },
    ],
  },
  {
    id: 'q5',
    text: '您的主要投资目的？',
    options: [
      { value: 'A', label: 'A. 保本' },
      { value: 'B', label: 'B. 稳健增值' },
      { value: 'C', label: 'C. 高收益' },
    ],
  },
];

const RISK_PROFILE_NAMES: Record<string, string> = {
  conservative: '保守型',
  moderate: '稳健型',
  aggressive: '激进型',
};

export default function Strategy({ navigateTo }: StrategyProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expectedReturn, setExpectedReturn] = useState(10);
  const [maxDrawdown, setMaxDrawdown] = useState(15);
  const [strategy, setStrategy] = useState<InvestmentStrategy | null>(null);
  const [tradingPlan, setTradingPlan] = useState<string[]>([]);
  const [analysisTab, setAnalysisTab] = useState<'fundamental' | 'technical'>('fundamental');
  const [fundamentalData, setFundamentalData] = useState<FundamentalAnalysis | null>(null);
  const [technicalData, setTechnicalData] = useState<TechnicalAnalysis | null>(null);
  const [amount, setAmount] = useState(100000);
  const [nsiHealth, setNsiHealth] = useState<{ score: number; suggestions: string[] } | null>(null);
  const [nsiEnhancedRisk, setNsiEnhancedRisk] = useState<{ adjustedProfile: string; adjustmentReason: string } | null>(null);
  const [nsiLoading, setNsiLoading] = useState(false);
  const [showSimModal, setShowSimModal] = useState(false);
  const [simPeriod, setSimPeriod] = useState('1M');
  const [simResult, setSimResult] = useState<{ return: number; maxDrawdown: number; sharpe: number; benchmarkReturn: number } | null>(null);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const canProceedToStep2 = () => {
    return Object.keys(answers).length === 5;
  };

  const handleCalculateRisk = async () => {
    setLoading(true);
    setError(null);
    try {
      const riskResult = await strategyApi.calculateRiskScore(answers);
      const recommendData = await strategyApi.getRecommendation(riskResult.riskProfile);
      setRecommendation(recommendData);
      const productsData = await strategyApi.getProductsByRiskLevel(riskResult.riskProfile);
      setProducts(productsData);
      setCurrentStep(2);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleViewStrategy = async () => {
    if (!recommendation) return;
    setLoading(true);
    setError(null);
    try {
      const s = await strategyApi.getStrategy(recommendation.riskProfile);
      setStrategy(s);
      const plan = await strategyApi.getTradingPlan(recommendation.riskProfile, amount);
      setTradingPlan(plan);
      const prodId = products[0]?.id || 'P-MOD-001';
      const fd = await strategyApi.getFundamentalAnalysis(prodId);
      setFundamentalData(fd);
      const td = await strategyApi.getTechnicalAnalysis('600519');
      setTechnicalData(td);
      setCurrentStep(4);

      setNsiLoading(true);
      try {
        const nsiUser = 'user-001';
        const [healthRes, enhancedRes] = await Promise.all([
          strategyApi.getFinancialHealth(nsiUser),
          strategyApi.getEnhancedRisk(nsiUser, recommendation.riskProfile),
        ]);
        setNsiHealth(healthRes.data);
        setNsiEnhancedRisk(enhancedRes.data);
      } catch {
        setNsiHealth(null);
        setNsiEnhancedRisk(null);
      } finally {
        setNsiLoading(false);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!recommendation) return null;
    const { allocation } = recommendation;
    return {
      labels: ['现金', '存款', '基金', '股票'],
      datasets: [
        {
          label: '资产配置比例 (%)',
          data: [allocation.CASH, allocation.DEPOSIT, allocation.FUND, allocation.STOCK],
          backgroundColor: ['#00cc66', '#0066cc', '#cc6600', '#cc0000'],
          borderColor: ['#00cc66', '#0066cc', '#cc6600', '#cc0000'],
          borderWidth: 1,
        },
      ],
    };
  };

  const getRadarData = () => {
    const score = (val: string) => val === 'A' ? 25 : val === 'B' ? 50 : 75;
    const reverse = (val: string) => val === 'A' ? 75 : val === 'B' ? 50 : 25;
    const q1 = answers['q1'], q2 = answers['q2'], q3 = answers['q3'], q4 = answers['q4'], q5 = answers['q5'];
    return {
      labels: ['风险偏好', '流动性需求', '投资经验', '风险承受', '收益预期'],
      datasets: [
        {
          label: '风险画像',
          data: [
            Math.round((reverse(q1) + score(q5)) / 2),
            Math.round((reverse(q4) + score(q1)) / 2),
            score(q2),
            score(q3),
            Math.round((score(q4) + score(q5)) / 2),
          ],
          backgroundColor: 'rgba(0, 102, 204, 0.2)',
          borderColor: '#0066cc',
          borderWidth: 2,
          pointBackgroundColor: '#0066cc',
        },
      ],
    };
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
        },
      },
    },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: '投资者风险画像',
        font: { size: 16 },
      },
    },
  };

  const deviation = useMemo(() => {
    const baseReturn = 10;
    const baseDrawdown = 15;
    const returnDiff = Math.abs(expectedReturn - baseReturn) / baseReturn;
    const drawdownDiff = Math.abs(maxDrawdown - baseDrawdown) / baseDrawdown;
    return Math.round((returnDiff + drawdownDiff) / 2 * 100);
  }, [expectedReturn, maxDrawdown]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: '推荐资产配置比例',
        font: { size: 16 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value: string | number) => `${value}%`,
        },
      },
    },
  };

  const renderStep1 = () => (
    <div>
      <div style={{
        background: 'var(--bg-card)',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: 'var(--shadow-card)',
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '24px' }}>风险评估问卷</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>请回答以下5个问题，我们将为您推荐合适的投资策略。</p>

        {QUESTIONS.map((question, index) => (
          <div key={question.id} style={{ marginBottom: '24px' }}>
            <p style={{ fontWeight: '500', marginBottom: '12px' }}>
              {index + 1}. {question.text}
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' as const }}>
              {question.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswerChange(question.id, option.value)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: answers[question.id] === option.value ? '2px solid #0066cc' : '1px solid var(--border-color)',
                    background: answers[question.id] === option.value ? '#e6f7ff' : 'white',
                    color: answers[question.id] === option.value ? 'var(--brand-blue)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
          <button
            onClick={() => navigateTo('dashboard')}
            style={{
              padding: '12px 24px',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              background: 'var(--bg-card)',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            ← 返回
          </button>
          <button
            onClick={handleCalculateRisk}
            disabled={!canProceedToStep2() || loading}
            style={{
              padding: '12px 32px',
              borderRadius: '4px',
              border: 'none',
              background: canProceedToStep2() ? '#0066cc' : '#ccc',
              color: 'white',
              cursor: canProceedToStep2() ? 'pointer' : 'not-allowed',
              fontSize: '16px',
            }}
          >
            {loading ? '计算中...' : '查看推荐方案'}
          </button>
        </div>
      </div>
      {error && (
        <p style={{ color: 'var(--semantic-red)', textAlign: 'center', marginTop: '16px' }}>{error}</p>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div>
      <div style={{
        background: 'var(--bg-card)',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: 'var(--shadow-card)',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{
            padding: '4px 12px',
            borderRadius: '12px',
            backgroundColor: '#e6f7ff',
            color: 'var(--brand-blue)',
            fontSize: '14px',
            fontWeight: '500',
          }}>
            风险等级: {recommendation?.riskLevel}
          </span>
          <h2 style={{ margin: 0 }}>
            {RISK_PROFILE_NAMES[recommendation?.riskProfile || '']}投资者
          </h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '0' }}>
          根据您的问卷答案，我们推荐您采用以下资产配置方案，以平衡风险与收益。
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div style={{
          background: 'var(--bg-card)',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-card)',
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px' }}>资产配置建议</h3>
          {(() => { const cd = getChartData(); return cd && (
            <div style={{ maxHeight: '300px' }}>
              <Bar data={cd} options={chartOptions} />
            </div>
          ); })()}
        </div>

        <div style={{
          background: 'var(--bg-card)',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-card)',
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px' }}>配置明细</h3>
          {recommendation?.allocation && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(recommendation.allocation).map(([type, percentage]) => (
                <div key={type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      display: 'inline-block',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: type === 'CASH' ? '#00cc66' : type === 'DEPOSIT' ? '#0066cc' : type === 'FUND' ? '#cc6600' : '#cc0000',
                    }} />
                    <span style={{ fontWeight: '500' }}>
                      {type === 'CASH' ? '现金' : type === 'DEPOSIT' ? '存款' : type === 'FUND' ? '基金' : '股票'}
                    </span>
                  </div>
                  <span className="data-font" style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--brand-blue)' }}>{percentage}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{
        background: 'var(--bg-card)',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: 'var(--shadow-card)',
        marginBottom: '24px',
      }}>
        {getRadarData() && (
          <div style={{ maxHeight: '300px', maxWidth: '300px', margin: '0 auto' }}>
            <Radar data={getRadarData()} options={radarOptions} />
          </div>
        )}
      </div>

      <div style={{
        background: 'var(--bg-card)',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: 'var(--shadow-card)',
        marginBottom: '24px',
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>参数调整</h3>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>预期收益: {expectedReturn}%</span>
          </label>
          <input
            type="range"
            min="5"
            max="20"
            step="1"
            value={expectedReturn}
            onChange={(e) => setExpectedReturn(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>最大回撤: {maxDrawdown}%</span>
          </label>
          <input
            type="range"
            min="5"
            max="30"
            step="1"
            value={maxDrawdown}
            onChange={(e) => setMaxDrawdown(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        {deviation > 0 && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fff7e6',
            border: '1px solid #ffd591',
            borderRadius: '4px',
            color: '#d46b08',
            fontSize: '14px',
          }}>
            ⚠ 当前配置已偏离推荐组合{deviation}%
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button
          onClick={() => {
            setCurrentStep(1);
            setAnswers({});
          }}
          style={{
            padding: '12px 24px',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            background: 'var(--bg-card)',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
          }}
        >
          ← 重新评估
        </button>
        <button
          onClick={() => setCurrentStep(3)}
          style={{
            padding: '12px 32px',
            borderRadius: '4px',
            border: 'none',
            background: '#0066cc',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          查看推荐产品 →
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <div style={{
        background: 'var(--bg-card)',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: 'var(--shadow-card)',
        marginBottom: '24px',
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '16px' }}>推荐产品</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 0 }}>
          根据您的风险偏好，我们为您精选以下产品：
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              background: 'var(--bg-card)',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              borderLeft: '4px solid #0066cc',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, marginBottom: '4px' }}>{product.name}</h3>
                <span style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  fontSize: '12px',
                  borderRadius: '4px',
                  backgroundColor: product.type === 'CASH' ? '#e6f7ff' : product.type === 'DEPOSIT' ? '#f6ffed' : product.type === 'FUND' ? '#fff7e6' : '#fff2f2',
                  color: product.type === 'CASH' ? '#0066cc' : product.type === 'DEPOSIT' ? '#00cc66' : product.type === 'FUND' ? '#cc6600' : '#cc0000',
                }}>
                  {product.type === 'CASH' ? '现金管理' : product.type === 'DEPOSIT' ? '定期存款' : product.type === 'FUND' ? '基金' : '股票'}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p className="data-font" style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: 'var(--semantic-green)' }}>
                  {product.expectedReturn}%
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-tertiary)' }}>预期年化收益</p>
              </div>
            </div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>{product.description}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button
          onClick={() => setCurrentStep(2)}
          style={{
            padding: '12px 24px',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            background: 'var(--bg-card)',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
          }}
        >
          ← 返回配置方案
        </button>
        <button
          onClick={handleViewStrategy}
          style={{
            padding: '12px 32px',
            borderRadius: '4px',
            border: 'none',
            background: '#0066cc',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          查看投资策略 →
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div>
      <div style={{
        background: 'var(--bg-card)',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: 'var(--shadow-card)',
        marginBottom: '24px',
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '16px' }}>投资策略详情</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 0 }}>
          基于您的风险偏好，以下是详细的投资策略建议。
        </p>
      </div>

      {strategy && (
        <div style={{
          background: 'var(--bg-card)',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-card)',
          marginBottom: '24px',
          borderTop: '3px solid var(--brand-gold)',
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px' }}>策略要点</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--text-tertiary)' }}>建仓时机</p>
              <p style={{ margin: 0, fontWeight: '500' }}>{strategy.entryTiming}</p>
            </div>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--text-tertiary)' }}>持有周期</p>
              <p style={{ margin: 0, fontWeight: '500' }}>{strategy.holdingPeriod}</p>
            </div>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--text-tertiary)' }}>止盈策略</p>
              <p style={{ margin: 0, fontWeight: '500' }}>{strategy.stopProfitLevel}</p>
            </div>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--text-tertiary)' }}>止损策略</p>
              <p style={{ margin: 0, fontWeight: '500' }}>{strategy.stopLossLevel}</p>
            </div>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--text-tertiary)' }}>风险管理</p>
              <p style={{ margin: 0, fontWeight: '500' }}>{strategy.riskMgmtAdvice}</p>
            </div>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--text-tertiary)' }}>资金管理</p>
              <p style={{ margin: 0, fontWeight: '500' }}>{strategy.capitalMgmtAdvice}</p>
            </div>
          </div>
        </div>
      )}

      <div style={{
        background: 'var(--bg-card)',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: 'var(--shadow-card)',
        marginBottom: '24px',
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>交易方案</h3>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>投资金额</span>
            <span className="data-font" style={{ fontWeight: 'bold', color: 'var(--brand-blue)' }}>¥{amount.toLocaleString()}</span>
          </label>
          <input
            type="range"
            min="10000"
            max="1000000"
            step="10000"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tradingPlan.map((step, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '12px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '8px',
            }}>
              <div style={{
                minWidth: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#0066cc',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold',
              }}>
                {index + 1}
              </div>
              <p style={{ margin: '4px 0 0 0' }}>{step}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        background: 'var(--bg-card)',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: 'var(--shadow-card)',
        marginBottom: '24px',
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>智能分析</h3>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button
            onClick={() => setAnalysisTab('fundamental')}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: analysisTab === 'fundamental' ? '2px solid #0066cc' : '1px solid var(--border-color)',
              background: analysisTab === 'fundamental' ? '#e6f7ff' : 'white',
              color: analysisTab === 'fundamental' ? 'var(--brand-blue)' : 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            基本面分析
          </button>
          <button
            onClick={() => setAnalysisTab('technical')}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: analysisTab === 'technical' ? '2px solid #0066cc' : '1px solid var(--border-color)',
              background: analysisTab === 'technical' ? '#e6f7ff' : 'white',
              color: analysisTab === 'technical' ? 'var(--brand-blue)' : 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            技术面分析
          </button>
        </div>

        {analysisTab === 'fundamental' && fundamentalData && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-tertiary)' }}>市盈率 (PE)</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: 'var(--brand-blue)' }}>{fundamentalData.pe}</p>
            </div>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-tertiary)' }}>市净率 (PB)</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: 'var(--brand-blue)' }}>{fundamentalData.pb}</p>
            </div>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-tertiary)' }}>净资产收益率 (ROE)</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: 'var(--semantic-green)' }}>{fundamentalData.roe}%</p>
            </div>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-tertiary)' }}>营收增长率</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: 'var(--semantic-green)' }}>{fundamentalData.revenueGrowth}%</p>
            </div>
          </div>
        )}

        {analysisTab === 'technical' && technicalData && (
          <div>
            <div style={{
              padding: '16px',
              backgroundColor: '#fff7e6',
              border: '1px solid #ffd591',
              borderRadius: '8px',
              marginBottom: '16px',
            }}>
              <p style={{ margin: 0, fontWeight: '500' }}>{technicalData.trend}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-tertiary)' }}>支撑位</p>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: 'var(--semantic-green)' }}>{technicalData.support}</p>
              </div>
              <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-tertiary)' }}>阻力位</p>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: 'var(--semantic-red)' }}>{technicalData.resistance}</p>
              </div>
              <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-tertiary)' }}>RSI</p>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: technicalData.rsi > 70 ? '#cc0000' : technicalData.rsi < 30 ? '#00cc66' : '#0066cc' }}>{technicalData.rsi}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {(nsiHealth || nsiEnhancedRisk) && (
        <div style={{
          background: 'var(--bg-card)',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-card)',
          marginBottom: '24px',
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px' }}>NSI 协同 - 社保健康评估</h3>
          {nsiHealth && (
            <div style={{ marginBottom: nsiEnhancedRisk ? '16px' : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '36px', fontWeight: 'bold', color: nsiHealth.score >= 70 ? '#00cc66' : nsiHealth.score >= 40 ? '#cc6600' : '#cc0000' }}>
                  {nsiHealth.score}
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>/ 100</span>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  backgroundColor: nsiHealth.score >= 70 ? '#f6ffed' : nsiHealth.score >= 40 ? '#fff7e6' : '#fff2f2',
                  color: nsiHealth.score >= 70 ? '#00cc66' : nsiHealth.score >= 40 ? '#cc6600' : '#cc0000',
                }}>
                  {nsiHealth.score >= 70 ? '良好' : nsiHealth.score >= 40 ? '一般' : '需关注'}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {nsiHealth.suggestions.map((s, i) => (
                  <div key={i} style={{
                    padding: '8px 12px',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                  }}>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}
          {nsiEnhancedRisk && (
            <div style={{
              padding: '12px',
              backgroundColor: '#e6f7ff',
              border: '1px solid #91d5ff',
              borderRadius: '6px',
            }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--brand-blue)' }}>NSI 风险调整</p>
              <p style={{ margin: 0, fontWeight: '500', color: '#0050b3' }}>
                {nsiEnhancedRisk.adjustmentReason}
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#0050b3' }}>
                调整后风险等级: <strong>{nsiEnhancedRisk.adjustedProfile === 'conservative' ? '保守型' : nsiEnhancedRisk.adjustedProfile === 'moderate' ? '稳健型' : '激进型'}</strong>
              </p>
            </div>
          )}
          {nsiLoading && <p style={{ color: 'var(--text-tertiary)' }}>加载 NSI 数据...</p>}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button
          onClick={() => setCurrentStep(3)}
          style={{
            padding: '12px 24px',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            background: 'white',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
          }}
        >
          ← 返回推荐产品
        </button>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowSimModal(true)}
            style={{
              padding: '12px 24px',
              borderRadius: '4px',
              border: '1px solid #00cc66',
              background: 'white',
              color: 'var(--semantic-green)',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            ▶ 去模拟
          </button>
          <button
            onClick={() => navigateTo('dashboard')}
            style={{
              padding: '12px 32px',
              borderRadius: '4px',
              border: 'none',
              background: '#0066cc',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            返回控制台
          </button>
        </div>
      </div>

      {/* 模拟交易 Modal */}
      {showSimModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '480px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>模拟交易</h2>
              <button onClick={() => setShowSimModal(false)} style={{ fontSize: '24px', border: 'none', background: 'none', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px',
            }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>当前策略参数</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>风险等级</span>
                <span style={{ fontWeight: '500' }}>{recommendation?.riskLevel} - {RISK_PROFILE_NAMES[recommendation?.riskProfile || '']}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>资产配置</span>
                <span style={{ fontWeight: '500' }}>
                  {recommendation ? `${recommendation.allocation.CASH + recommendation.allocation.DEPOSIT}% 固收 / ${recommendation.allocation.FUND + recommendation.allocation.STOCK}% 权益` : '-'}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>回测周期</h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[['1M', '近1月'], ['3M', '近3月'], ['6M', '近6月'], ['1Y', '近1年']].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setSimPeriod(value)}
                    style={{
                      flex: 1,
                      padding: '10px 8px',
                      borderRadius: '6px',
                      border: simPeriod === value ? '2px solid #0066cc' : '1px solid var(--border-color)',
                      background: simPeriod === value ? '#e6f7ff' : 'white',
                      color: simPeriod === value ? 'var(--brand-blue)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                const factors: Record<string, number> = { '1M': 0.8, '3M': 1.0, '6M': 1.2, '1Y': 1.5 };
                const factor = factors[simPeriod] || 1;
                setSimResult({
                  return: (6 + Math.random() * 10) * factor,
                  maxDrawdown: 5 + Math.random() * 12,
                  sharpe: 0.8 + Math.random() * 1.5,
                  benchmarkReturn: (3 + Math.random() * 6) * factor,
                });
              }}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                border: 'none',
                background: '#0066cc',
                color: 'white',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                marginBottom: '20px',
              }}
            >
              开始回测
            </button>

            {simResult && (
              <div>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>回测结果</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ background: '#f0fff4', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>模拟收益</p>
                    <p style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: 'var(--semantic-green)' }}>+{simResult.return.toFixed(1)}%</p>
                  </div>
                  <div style={{ background: '#fff5f5', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>最大回撤</p>
                    <p style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: 'var(--semantic-red)' }}>-{simResult.maxDrawdown.toFixed(1)}%</p>
                  </div>
                  <div style={{ background: '#e6f7ff', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>夏普比率</p>
                    <p style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: 'var(--brand-blue)' }}>{simResult.sharpe.toFixed(2)}</p>
                  </div>
                  <div style={{ background: '#fff7e6', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>基准收益</p>
                    <p style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#cc6600' }}>+{simResult.benchmarkReturn.toFixed(1)}%</p>
                  </div>
                </div>
                <div style={{
                  padding: '12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  color: simResult.return >= simResult.benchmarkReturn ? '#00cc66' : '#cc0000',
                }}>
                  {simResult.return >= simResult.benchmarkReturn ? '跑赢基准 ' : '跑输基准 '}
                  <strong>{Math.abs(simResult.return - simResult.benchmarkReturn).toFixed(1)}%</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigateTo('dashboard')}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            padding: '8px 16px',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            marginBottom: '12px',
          }}
        >
          ← 返回控制台
        </button>
        <h1 style={{ margin: 0 }}>投资策略</h1>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              background: currentStep >= step ? '#0066cc' : 'var(--border-color)',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>

        {loading && currentStep === 1 && <StepSkeleton />}
        {!loading && currentStep === 1 && renderStep1()}
        {loading && currentStep === 2 && <CardSkeleton />}
        {!loading && currentStep === 2 && renderStep2()}
        {loading && (currentStep === 3 || currentStep === 4) && <CardSkeleton />}
        {!loading && currentStep === 3 && renderStep3()}
        {!loading && currentStep === 4 && renderStep4()}
    </div>
  );
}