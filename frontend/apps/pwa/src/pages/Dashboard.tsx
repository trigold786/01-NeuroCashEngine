import { useAuthStore } from '@nce/shared';

export default function Dashboard() {
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
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
      }}>
        <h2>欢迎，{user?.username}！</h2>
        <p>邮箱：{user?.email}</p>
        <p>账号类型：{user?.accountType === 'enterprise' ? '企业用户' : '个人用户'}</p>
        {user?.companyName && <p>企业名称：{user.companyName}</p>}
        {user?.industryName && <p>所属行业：{user.industryName}</p>}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '30px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3>资产概览（开发中）</h3>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3>资讯中心（开发中）</h3>
        </div>
      </div>
    </div>
  );
}
