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

export type Page = 'login' | 'register' | 'dashboard' | 'assets' | 'news' | 'news-detail' | 'business-cashflow' | 'business-sops' | 'business-sop-detail' | 'strategy' | 'enterprise-strategy' | 'portfolio-monitoring' | 'points';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [currentPage, setCurrentPage] = React.useState<Page>(isAuthenticated ? 'dashboard' : 'login');
  const [currentNewsId, setCurrentNewsId] = React.useState<string | null>(null);
  const [currentSopId, setCurrentSopId] = React.useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  React.useEffect(() => {
    if (isAuthenticated && (currentPage === 'login' || currentPage === 'register')) {
      setCurrentPage('dashboard');
    }
  }, [isAuthenticated, currentPage]);

  if (!isAuthenticated && !['login', 'register'].includes(currentPage)) {
    setCurrentPage('login');
  }

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
      default:
        return <Dashboard navigateTo={setCurrentPage} setCurrentNewsId={setCurrentNewsId} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}>
        <h1 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>NeuroCashEngine</h1>
        {currentPage === 'login' ? (
          <>
            <Login />
            <p style={{ marginTop: '20px' }}>
              没有账号？
              <button
                onClick={() => setCurrentPage('register')}
                style={{ marginLeft: '10px', border: 'none', background: 'none', color: 'var(--brand-blue)', cursor: 'pointer' }}
              >
                立即注册
              </button>
            </p>
          </>
        ) : (
          <>
            <Register />
            <p style={{ marginTop: '20px' }}>
              已有账号？
              <button
                onClick={() => setCurrentPage('login')}
                style={{ marginLeft: '10px', border: 'none', background: 'none', color: 'var(--brand-blue)', cursor: 'pointer' }}
              >
                立即登录
              </button>
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
      <ThemeToggle />
      {renderPage()}
    </div>
  );
}

export default App;
