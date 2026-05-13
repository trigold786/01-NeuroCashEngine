import { Page } from '../App';

interface PrivacyPageProps {
  navigateTo: (page: Page) => void;
}

export default function PrivacyPage({ navigateTo }: PrivacyPageProps) {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
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

      <div style={{
        background: 'var(--bg-card)',
        padding: '32px',
        borderRadius: '8px',
        boxShadow: 'var(--shadow-card)',
        lineHeight: '1.8',
        fontSize: '14px',
        color: 'var(--text-primary)',
      }}>
        <h1 style={{ marginBottom: '24px' }}>隐私政策</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>最后更新：2026年1月1日</p>

        <h2>一、总则</h2>
        <p>NeuroCashEngine（以下简称"本平台"）严格遵守《中华人民共和国网络安全法》《中华人民共和国数据安全法》《中华人民共和国个人信息保护法》及相关法律法规。本隐私政策旨在向您说明我们如何收集、使用、存储和保护您的个人信息。</p>

        <h2>二、信息收集</h2>
        <p>我们在以下场景收集您的信息：</p>
        <ul>
          <li><strong>注册信息：</strong>邮箱地址、手机号码、用户名、密码等账户基本信息</li>
          <li><strong>身份信息：</strong>企业用户需提供企业名称、行业类别、统一社会信用代码等</li>
          <li><strong>资产信息：</strong>您绑定的银行账户、证券账户、基金账户等资产相关信息</li>
          <li><strong>使用数据：</strong>您的操作记录、浏览行为、功能使用频率等</li>
          <li><strong>设备信息：</strong>IP地址、浏览器类型、操作系统等基础设备信息</li>
        </ul>

        <h2>三、信息使用</h2>
        <p>我们收集的信息用于以下目的：</p>
        <ul>
          <li>提供、维护和改进本平台服务</li>
          <li>风险评估和现金流预测分析</li>
          <li>个性化投资策略推荐</li>
          <li>发送账户预警和重要通知</li>
          <li>遵守法律法规和监管要求</li>
        </ul>

        <h2>四、数据安全</h2>
        <p>我们采取以下措施保障您的数据安全：</p>
        <ul>
          <li>采用国家级加密算法对敏感数据进行加密存储</li>
          <li>实施严格的访问控制和权限管理机制</li>
          <li>定期进行安全审计和漏洞扫描</li>
          <li>建立数据安全事件应急响应机制</li>
          <li>所有数据传输使用TLS加密协议</li>
        </ul>

        <h2>五、用户权利</h2>
        <p>根据《个人信息保护法》，您享有以下权利：</p>
        <ul>
          <li><strong>知情权：</strong>了解我们如何收集和使用您的个人信息</li>
          <li><strong>访问权：</strong>访问和查看我们持有的您的个人信息</li>
          <li><strong>更正权：</strong>发现信息不准确时要求更正</li>
          <li><strong>删除权：</strong>在符合法律规定的情况下要求删除个人信息</li>
          <li><strong>撤回同意权：</strong>撤回您对信息处理的同意</li>
          <li><strong>注销权：</strong>注销账户，我们将依法删除您的信息</li>
        </ul>

        <h2>六、数据存储与保留</h2>
        <p>您的数据存储在中国境内服务器。我们仅在实现目的所必需的最短时间内保留您的个人信息，除非法律法规另有要求。账户注销后，我们将在30天内删除或匿名化处理您的个人信息，但法律要求保留的日志记录除外。</p>

        <h2>七、第三方数据共享</h2>
        <p>我们不会向第三方出售您的个人信息。在以下情况下，我们可能会依法共享您的信息：</p>
        <ul>
          <li>获得您的明确同意</li>
          <li>法律法规或监管机构要求</li>
          <li>为保护生命财产安全所必需</li>
          <li>与为我们提供服务的合作伙伴共享（如云服务商），这些合作伙伴受严格的保密协议约束</li>
        </ul>

        <h2>八、未成年人保护</h2>
        <p>本平台不面向未成年人提供服务。如发现我们无意中收集了未成年人的个人信息，请立即联系我们，我们将及时删除相关数据。</p>

        <h2>九、政策更新</h2>
        <p>我们可能会不时更新本隐私政策。重大变更将通过平台公告或邮件方式通知您。继续使用本平台即表示您同意更新后的政策。</p>

        <h2>十、联系方式</h2>
        <p>如您对本隐私政策有任何疑问或需要行使上述权利，请联系我们：</p>
        <p>邮箱：privacy@neurocashengine.com</p>
        <p>地址：北京市海淀区中关村科技园区</p>
      </div>
    </div>
  );
}
