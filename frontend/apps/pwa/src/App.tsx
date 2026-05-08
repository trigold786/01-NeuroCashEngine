import { useAuthStore } from '@nce/shared';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [currentPage, setCurrentPage] = React.useState('login');

  if (isAuthenticated) {
    return <Dashboard />;
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      padding: '20px' 
    }}>
      <h1 style={{ marginBottom: '20px' }}>NeuroCashEngine</h1>
      
      {currentPage === 'login' ? (
        <>
          <Login />
          <p style={{ marginTop: '20px' }}>
            没有账号？
            <button 
              onClick={() => setCurrentPage('register')}
              style={{ marginLeft: '10px', border: 'none', background: 'none', color: '#0066cc', cursor: 'pointer' }}
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
              style={{ marginLeft: '10px', border: 'none', background: 'none', color: '#0066cc', cursor: 'pointer' }}
            >
              立即登录
            </button>
          </p>
        </>
      )}
    </div>
  );
}

export default App;
