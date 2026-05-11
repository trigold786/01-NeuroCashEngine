import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Page } from '../App';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface StrategyProps {
  navigateTo: (page: Page) => void;
}

interface Product {
  id: string;
  name: string;
  type: string;
  expectedReturn: number;
  riskLevel: number;
  description: string;
}

interface Recommendation {
  riskProfile: string;
  allocation: { CASH: number; DEPOSIT: number; FUND: number; STOCK: number };
  riskLevel: number;
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
      const response = await fetch('/api/strategy/risk-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answers),
      });
      if (!response.ok) throw new Error('Failed to calculate risk profile');
      const data = await response.json();

      const recommendResponse = await fetch('/api/strategy/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ riskProfile: data.riskProfile }),
      });
      if (!recommendResponse.ok) throw new Error('Failed to get recommendation');
      const recommendData = await recommendResponse.json();
      setRecommendation(recommendData);

      const productsResponse = await fetch(`/api/strategy/products?riskLevel=${data.riskProfile}`);
      if (!productsResponse.ok) throw new Error('Failed to get products');
      const productsData = await productsResponse.json();
      setProducts(productsData);

      setCurrentStep(2);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
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
        background: 'white',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '24px' }}>风险评估问卷</h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>请回答以下5个问题，我们将为您推荐合适的投资策略。</p>

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
                    border: answers[question.id] === option.value ? '2px solid #0066cc' : '1px solid #ddd',
                    background: answers[question.id] === option.value ? '#e6f7ff' : 'white',
                    color: answers[question.id] === option.value ? '#0066cc' : '#333',
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
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: 'white',
              cursor: 'pointer',
              color: '#666',
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
        <p style={{ color: '#cc0000', textAlign: 'center', marginTop: '16px' }}>{error}</p>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div>
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{
            padding: '4px 12px',
            borderRadius: '12px',
            backgroundColor: '#e6f7ff',
            color: '#0066cc',
            fontSize: '14px',
            fontWeight: '500',
          }}>
            风险等级: {recommendation?.riskLevel}
          </span>
          <h2 style={{ margin: 0 }}>
            {RISK_PROFILE_NAMES[recommendation?.riskProfile || '']}投资者
          </h2>
        </div>
        <p style={{ color: '#666', marginBottom: '0' }}>
          根据您的问卷答案，我们推荐您采用以下资产配置方案，以平衡风险与收益。
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px' }}>资产配置建议</h3>
          {recommendation && (
            <div style={{ maxHeight: '300px' }}>
              <Bar data={getChartData()!} options={chartOptions} />
            </div>
          )}
        </div>

        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px' }}>配置明细</h3>
          {recommendation?.allocation && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(recommendation.allocation).map(([type, percentage]) => (
                <div key={type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
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
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#0066cc' }}>{percentage}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button
          onClick={() => {
            setCurrentStep(1);
            setAnswers({});
          }}
          style={{
            padding: '12px 24px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            background: 'white',
            cursor: 'pointer',
            color: '#666',
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
        background: 'white',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '24px',
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '16px' }}>推荐产品</h2>
        <p style={{ color: '#666', marginBottom: 0 }}>
          根据您的风险偏好，我们为您精选以下产品：
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              background: 'white',
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
                <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#00cc66' }}>
                  {product.expectedReturn}%
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>预期年化收益</p>
              </div>
            </div>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{product.description}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button
          onClick={() => setCurrentStep(2)}
          style={{
            padding: '12px 24px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            background: 'white',
            cursor: 'pointer',
            color: '#666',
          }}
        >
          ← 返回配置方案
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
  );

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
            marginBottom: '12px',
          }}
        >
          ← 返回控制台
        </button>
        <h1 style={{ margin: 0 }}>投资策略</h1>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              background: currentStep >= step ? '#0066cc' : '#e0e0e0',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>

      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
    </div>
  );
}