import React, { useState } from 'react';
import { useAuthStore } from '@nce/shared';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await login({ email, password });
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
      <h2 style={{ marginBottom: '10px' }}>登录</h2>
      
      {error && (
        <p style={{ color: 'var(--semantic-red)', fontSize: '14px' }}>{error}</p>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label htmlFor="email">邮箱</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
        />
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label htmlFor="password">密码</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
        />
      </div>
      
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
        {isLoading ? '登录中...' : '登录'}
      </button>
    </form>
  );
}
