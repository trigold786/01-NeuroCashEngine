import { useState, useEffect, useCallback } from 'react';
import { Page } from '../App';

interface ApiPlaygroundProps {
  navigateTo: (page: Page) => void;
}

const API_DOCS: Record<string, { method: string; path: string; description: string; params?: string }> = {
  'forecast': { method: 'POST', path: '/business/cashflow/forecast', description: '生成现金流预测', params: '{"forecastDays": 90}' },
  'get-forecast': { method: 'GET', path: '/business/cashflow/forecast', description: '获取预测数据' },
  'overview': { method: 'GET', path: '/assets/overview', description: '获取资产概览' },
  'accounts': { method: 'GET', path: '/assets/accounts', description: '获取账户列表' },
  'strategy': { method: 'GET', path: '/strategy/products?riskLevel=conservative', description: '获取推荐产品' },
  'points': { method: 'GET', path: '/points/balance', description: '获取积分余额' },
};

const CODE_EXAMPLES: Record<string, string> = {
  curl: `curl -X GET "http://localhost:3005/business/cashflow/forecast" \\
  -H "Authorization: Bearer YOUR_TOKEN"`,
  python: `import requests

url = "http://localhost:3005/business/cashflow/forecast"
headers = {"Authorization": "Bearer YOUR_TOKEN"}
response = requests.get(url, headers=headers)
print(response.json())`,
  javascript: `const response = await fetch(
  "http://localhost:3005/business/cashflow/forecast",
  { headers: { Authorization: "Bearer YOUR_TOKEN" } }
);
const data = await response.json();
console.log(data);`,
};

export default function ApiPlayground({ navigateTo }: ApiPlaygroundProps) {
  const [selectedEndpoint, setSelectedEndpoint] = useState('get-forecast');
  const [requestParams, setRequestParams] = useState('');
  const [responseData, setResponseData] = useState<string | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [codeLang, setCodeLang] = useState<'curl' | 'python' | 'javascript'>('curl');
  const [docs, setDocs] = useState<string | null>(null);

  const endpoint = API_DOCS[selectedEndpoint];
  const baseUrl = (import.meta as any).env?.VITE_CASHFLOW_API_URL || 'http://localhost:3005';

  const fetchDocs = useCallback(async () => {
    try {
      const res = await fetch(`${baseUrl}/data-product/docs`);
      if (res.ok) {
        setDocs(await res.text());
      }
    } catch { /* ignore */ }
  }, [baseUrl]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  useEffect(() => {
    if (endpoint?.params) setRequestParams(endpoint.params);
    else setRequestParams('');
  }, [selectedEndpoint, endpoint]);

  const handleSendRequest = async () => {
    setApiLoading(true);
    setApiError(null);
    setResponseData(null);
    try {
      const token = localStorage.getItem('nce_access_token');
      const url = `${baseUrl}${endpoint.path}`;
      const options: RequestInit = {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      };
      if (endpoint.method === 'POST' && requestParams) {
        options.body = requestParams;
      }
      const res = await fetch(url, options);
      const text = await res.text();
      try {
        setResponseData(JSON.stringify(JSON.parse(text), null, 2));
      } catch {
        setResponseData(text);
      }
    } catch (err: any) {
      setApiError(err.message || 'Request failed');
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <button
        onClick={() => navigateTo('dashboard')}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '4px',
          padding: '8px 16px',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          marginBottom: '16px',
        }}
      >
        ← 返回
      </button>

      <h1 style={{ marginBottom: '8px' }}>开放平台</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>NeuroCashEngine API 开发者门户 - 集成文档与在线测试</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div style={{
          background: 'var(--bg-card)',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-card)',
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '12px' }}>API 基础信息</h3>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>基础URL：</span>
            <code style={{ background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px', fontSize: '13px' }}>{baseUrl}</code>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>速率限制：</span>
            <code style={{ background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px', fontSize: '13px' }}>100 req/min</code>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>认证方式：</span>
            <code style={{ background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px', fontSize: '13px' }}>Bearer Token (JWT)</code>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-card)',
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '12px' }}>认证说明</h3>
          <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
            所有API请求需要在HTTP Header中添加Authorization字段：
          </p>
          <code style={{
            display: 'block',
            background: 'var(--bg-secondary)',
            padding: '12px',
            borderRadius: '6px',
            fontSize: '13px',
            wordBreak: 'break-all',
          }}>
            Authorization: Bearer your_jwt_token_here
          </code>
          <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: 'var(--text-tertiary)' }}>
            通过登录接口获取JWT Token，有效期24小时
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', marginBottom: '24px' }}>
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontWeight: '600', fontSize: '14px' }}>
            API 端点列表
          </div>
          <div style={{ padding: '8px' }}>
            {Object.entries(API_DOCS).map(([key, ep]) => (
              <div
                key={key}
                onClick={() => setSelectedEndpoint(key)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: selectedEndpoint === key ? 'var(--bg-secondary)' : 'transparent',
                  marginBottom: '4px',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{
                    padding: '1px 6px',
                    borderRadius: '3px',
                    fontSize: '11px',
                    fontWeight: '600',
                    backgroundColor: ep.method === 'GET' ? '#e6f7ff' : '#f6ffed',
                    color: ep.method === 'GET' ? '#0066cc' : '#00cc66',
                  }}>
                    {ep.method}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ep.path}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{ep.description}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-card)',
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px' }}>API 测试工具</h3>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              请求地址
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: endpoint?.method === 'GET' ? '#e6f7ff' : '#f6ffed',
                color: endpoint?.method === 'GET' ? '#0066cc' : '#00cc66',
              }}>
                {endpoint?.method}
              </span>
              <code style={{
                flex: 1,
                padding: '8px 12px',
                background: 'var(--bg-secondary)',
                borderRadius: '4px',
                fontSize: '13px',
              }}>
                {endpoint?.path}
              </code>
            </div>
          </div>

          {endpoint?.method === 'POST' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                请求体 (JSON)
              </label>
              <textarea
                value={requestParams}
                onChange={(e) => setRequestParams(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          <button
            onClick={handleSendRequest}
            disabled={apiLoading}
            style={{
              padding: '10px 24px',
              backgroundColor: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              opacity: apiLoading ? 0.7 : 1,
              marginBottom: '16px',
            }}
          >
            {apiLoading ? '请求中...' : '发送请求'}
          </button>

          {apiError && (
            <div style={{
              padding: '12px',
              backgroundColor: '#fff0f0',
              border: '1px solid #ffcccc',
              borderRadius: '4px',
              color: 'var(--semantic-red)',
              fontSize: '13px',
              marginBottom: '16px',
            }}>
              {apiError}
            </div>
          )}

          {responseData && (
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                响应结果
              </label>
              <pre style={{
                padding: '12px',
                background: 'var(--bg-secondary)',
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto',
                maxHeight: '300px',
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}>
                {responseData}
              </pre>
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
        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>SDK / 代码示例</h3>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {(['curl', 'python', 'javascript'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setCodeLang(lang)}
              style={{
                padding: '6px 14px',
                borderRadius: '4px',
                border: codeLang === lang ? '2px solid #0066cc' : '1px solid var(--border-color)',
                background: codeLang === lang ? '#e6f7ff' : 'var(--bg-card)',
                color: codeLang === lang ? 'var(--brand-blue)' : 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '13px',
                textTransform: 'capitalize',
              }}
            >
              {lang}
            </button>
          ))}
        </div>
        <pre style={{
          padding: '16px',
          background: 'var(--bg-secondary)',
          borderRadius: '8px',
          fontSize: '13px',
          overflow: 'auto',
          margin: 0,
          lineHeight: '1.5',
        }}>
          {CODE_EXAMPLES[codeLang]}
        </pre>
      </div>

      {docs && (
        <div style={{
          background: 'var(--bg-card)',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-card)',
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '12px' }}>数据产品文档</h3>
          <pre style={{
            padding: '16px',
            background: 'var(--bg-secondary)',
            borderRadius: '8px',
            fontSize: '12px',
            overflow: 'auto',
            maxHeight: '400px',
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}>
            {docs}
          </pre>
        </div>
      )}
    </div>
  );
}
