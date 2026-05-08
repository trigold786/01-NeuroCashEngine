import { useAuthStore } from '@nce/shared';

interface DashboardProps {
  navigateTo: (page: string) => void;
}

export default function Dashboard({ navigateTo }: DashboardProps) {
  const { user, logout } = useAuthStore();

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h1>NeuroCashEngine 控制台</h1>
        <button
          onClick={logout}
          style={{ padding: '10px 20px', backgroundColor: '#cc0000', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          退出登录
        </button>
      </div>

      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <h2>欢迎，{user?.username}！</h2>
        <p>邮箱：{user?.email}</p>
        <p>账号类型：{user?.accountType === 'ENTERPRISE' ? '企业用户' : '个人用户'}</p>
        {user?.companyName && <p>企业名称：{user.companyName}</p>}
        {user?.industryName && <p>所属行业：{user.industryName}</p>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          onClick={() => navigateTo('assets')}
        >
          <h3 style={{ color: '#0066cc', marginBottom: '8px' }}>📊 资产概览</h3>
          <p style={{ color: '#666' }}>查看和管理您的资产配置</p>
        </div>
        <div
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          onClick={() => navigateTo('news')}
        >
          <h3 style={{ color: '#0066cc', marginBottom: '8px' }}>📰 资讯中心</h3>
          <p style={{ color: '#666' }}>查看最新的金融市场资讯</p>
        </div>
      </div>
    </div>
  );
}
