import React, { useEffect } from 'react';
import { useAuthStore } from '@nce/shared';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AssetOverview from './pages/AssetOverview';
import NewsList from './pages/NewsList';
import NewsDetail from './pages/NewsDetail';
import BusinessCashFlow from './pages/BusinessCashFlow';
import BusinessSopList from './pages/BusinessSopList';
import BusinessSopDetail from './pages/BusinessSopDetail';
import Strategy from './pages/Strategy';
import EnterpriseStrategy from './pages/EnterpriseStrategy';
import PortfolioMonitoring from './pages/PortfolioMonitoring';
import PointsCenter from './pages/PointsCenter';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import ApiPlayground from './pages/ApiPlayground';
import Subscription from './pages/Subscription';
import NotificationCenter from './pages/NotificationCenter';
import ThemeToggle from './components/ThemeToggle';
import AlertBanner from './components/AlertBanner';
import UserSettings from './pages/UserSettings';

export type Page = 'login' | 'register' | 'dashboard' | 'assets' | 'news' | 'news-detail' | 'business-cashflow' | 'business-sops' | 'business-sop-detail' | 'strategy' | 'enterprise-strategy' | 'portfolio-monitoring' | 'points' | 'subscription' | 'notifications' | 'privacy' | 'terms' | 'api-playground' | 'user-settings';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [currentPage, setCurrentPage] = React.useState<Page>('dashboard');
  const [currentNewsId, setCurrentNewsId] = React.useState<string | null>(null);
  const [currentSopId, setCurrentSopId] = React.useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = React.useState<string>(
    typeof window !== 'undefined' ? localStorage.getItem('theme') || 'light' : 'light'
  );
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const [countdown, setCountdown] = React.useState(15);
  const PUBLIC_PAGES: Page[] = ['dashboard', 'news', 'news-detail', 'privacy', 'terms'];

  const toggleTheme = () => {
    const next = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  React.useEffect(() => {
    if (!isAuthenticated) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setShowLoginModal(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setShowLoginModal(false);
      setCountdown(15);
    }
  }, [isAuthenticated]);

  React.useEffect(() => {
    if (isAuthenticated && (currentPage === 'login' || currentPage === 'register')) {
      setCurrentPage('dashboard');
    }
  }, [isAuthenticated, currentPage]);

  React.useEffect(() => {
    if (!isAuthenticated && !PUBLIC_PAGES.includes(currentPage) && currentPage !== 'login' && currentPage !== 'register') {
      setCurrentPage('dashboard');
    }
  }, [isAuthenticated, currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <Login />;
      case 'register':
        return <Register />;
      case 'dashboard':
        return <Dashboard navigateTo={setCurrentPage} setCurrentNewsId={setCurrentNewsId} />;
      case 'assets':
        return <AssetOverview navigateTo={setCurrentPage} />;
      case 'news':
        return <NewsList navigateTo={setCurrentPage} setCurrentNewsId={setCurrentNewsId} />;
      case 'news-detail':
        if (!currentNewsId) {
          setCurrentPage('news');
          return null;
        }
        return <NewsDetail navigateTo={setCurrentPage} newsId={currentNewsId} />;
      case 'business-cashflow':
        return <BusinessCashFlow navigateTo={setCurrentPage} />;
      case 'business-sops':
        return <BusinessSopList navigateTo={setCurrentPage} setCurrentSopId={setCurrentSopId} />;
      case 'business-sop-detail':
        if (!currentSopId) {
          setCurrentPage('business-sops');
          return null;
        }
        return <BusinessSopDetail navigateTo={setCurrentPage} sopId={currentSopId} />;
      case 'strategy':
        return <Strategy navigateTo={setCurrentPage} />;
      case 'enterprise-strategy':
        return <EnterpriseStrategy navigateTo={setCurrentPage} />;
      case 'portfolio-monitoring':
        return <PortfolioMonitoring navigateTo={setCurrentPage} />;
      case 'points':
        return <PointsCenter navigateTo={setCurrentPage} />;
      case 'privacy':
        return <PrivacyPage navigateTo={setCurrentPage} />;
      case 'terms':
        return <TermsPage navigateTo={setCurrentPage} />;
      case 'user-settings':
        return <UserSettings navigateTo={setCurrentPage} currentTheme={currentTheme} onToggleTheme={toggleTheme} />;
      case 'subscription':
        return <Subscription navigateTo={setCurrentPage} />;
      case 'notifications':
        return <NotificationCenter navigateTo={setCurrentPage} />;
      case 'api-playground':
        return <ApiPlayground navigateTo={setCurrentPage} />;
      default:
        return <Dashboard navigateTo={setCurrentPage} setCurrentNewsId={setCurrentNewsId} />;
    }
  };

  const renderLoginModal = () => (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, padding: '20px',
    }}>
      <div style={{
        background: 'var(--bg-card)', borderRadius: '12px',
        padding: '32px', maxWidth: '400px', width: '100%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: '0 0 8px 0' }}>登录 NeuroCashEngine</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>
            登录后可使用完整功能
          </p>
        </div>
        <Login />
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'center' }}>
          <button
            onClick={() => setCurrentPage('register')}
            style={{ border: 'none', background: 'none', color: 'var(--brand-blue)', cursor: 'pointer', fontSize: '14px' }}
          >
            没有账号？立即注册
          </button>
          <button
            onClick={() => { setShowLoginModal(false); setCountdown(60); }}
            style={{ border: 'none', background: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '14px' }}
          >
            稍后再说
          </button>
        </div>
      </div>
    </div>
  );

  if (!isAuthenticated) {
    if (currentPage === 'login' || currentPage === 'register') {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', padding: '20px', background: 'var(--bg-primary)', color: 'var(--text-primary)',
        }}>
          <h1 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>NeuroCashEngine</h1>
          {currentPage === 'login' ? <Login /> : <Register />}
          <p style={{ marginTop: '20px' }}>
            {currentPage === 'login' ? '没有账号？' : '已有账号？'}
            <button
              onClick={() => setCurrentPage(currentPage === 'login' ? 'register' : 'login')}
              style={{ marginLeft: '10px', border: 'none', background: 'none', color: 'var(--brand-blue)', cursor: 'pointer' }}
            >
              {currentPage === 'login' ? '立即注册' : '立即登录'}
            </button>
          </p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '16px', fontSize: '12px' }}>
            <button onClick={() => { setCurrentPage('privacy'); }} style={{ border: 'none', background: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', textDecoration: 'underline' }}>隐私政策</button>
            <button onClick={() => { setCurrentPage('terms'); }} style={{ border: 'none', background: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', textDecoration: 'underline' }}>服务条款</button>
            <button onClick={() => setCurrentPage('dashboard')} style={{ border: 'none', background: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', textDecoration: 'underline' }}>浏览首页</button>
          </div>
        </div>
      );
    }

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 20px', gap: '8px', background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 100,
        }}>
          <span style={{ fontWeight: 'bold', color: 'var(--brand-blue)' }}>NeuroCashEngine</span>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {countdown > 0 && !showLoginModal && (
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                {countdown}秒后弹出登录
              </span>
            )}
            <button
              onClick={() => setShowLoginModal(true)}
              style={{
                padding: '6px 16px', backgroundColor: '#0066cc', color: 'white',
                border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px',
              }}
            >
              登录
            </button>
          </div>
        </div>
        {renderPage()}
        {showLoginModal && renderLoginModal()}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '8px 20px',
        gap: '8px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <AlertBanner />
        <ThemeToggle />
      </div>
      {renderPage()}
    </div>
  );
}

export default App;
