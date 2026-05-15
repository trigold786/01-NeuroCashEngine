import React, { useState, useEffect } from 'react';
import { useAuthStore, AccountType, cashflowApiClient } from '@nce/shared';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    phone: '',
    accountType: AccountType.INDIVIDUAL,
    companyName: '',
    industryCode: '',
    industryName: '',
  });
  const [referralCode, setReferralCode] = useState('');
  const { register, isLoading, error, clearError } = useAuthStore();

  // 检测URL中的推荐码参数
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref && ref.length === 8) {
      setReferralCode(ref);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await register(formData);
    if (referralCode) {
      try {
        await cashflowApiClient.post('/points/referral/redeem', { code: referralCode });
      } catch { /* ignore referral errors */ }
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '15px', 
      width: '100%', 
      maxWidth: '400px',
      background: 'var(--bg-card)',
      padding: '30px',
      borderRadius: '8px',
      boxShadow: 'var(--shadow-card)'
    }}>
      <h2 style={{ marginBottom: '10px' }}>注册</h2>
      
      {error && (
        <p style={{ color: 'var(--semantic-red)', fontSize: '14px' }}>{error}</p>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label htmlFor="username">用户名</label>
        <input
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
        />
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label htmlFor="email">邮箱</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
        />
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label htmlFor="password">密码</label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
        />
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label htmlFor="accountType">账号类型</label>
        <select
          id="accountType"
          name="accountType"
          value={formData.accountType}
          onChange={handleChange}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
        >
          <option value={AccountType.INDIVIDUAL}>个人用户</option>
          <option value={AccountType.ENTERPRISE}>企业用户</option>
        </select>
      </div>
      
      {formData.accountType === AccountType.ENTERPRISE && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label htmlFor="companyName">企业名称</label>
            <input
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label htmlFor="industryName">所属行业</label>
            <input
              id="industryName"
              name="industryName"
              value={formData.industryName}
              onChange={handleChange}
              placeholder="如：零售业、制造业"
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
            />
          </div>
        </>
      )}
      
      <button
        type="submit"
        disabled={isLoading}
        style={{
          padding: '12px',
          backgroundColor: '#0066cc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          cursor: 'pointer',
          opacity: isLoading ? 0.7 : 1
        }}
      >
        {isLoading ? '注册中...' : '注册'}
      </button>
    </form>
  );
}
