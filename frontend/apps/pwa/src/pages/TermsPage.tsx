import { Page } from '../App';

interface TermsPageProps {
  navigateTo: (page: Page) => void;
}

export default function TermsPage({ navigateTo }: TermsPageProps) {
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
        <h1 style={{ marginBottom: '24px' }}>服务条款</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>最后更新：2026年1月1日</p>

        <h2>一、服务说明</h2>
        <p>NeuroCashEngine（以下简称"本平台"）是一个提供现金流预测、风险评估、投资策略推荐及资产管理的综合金融服务平台。使用本平台服务即表示您同意本条款的全部内容。</p>

        <h2>二、用户责任</h2>
        <ul>
          <li>提供真实、准确、完整的注册信息和账户资料</li>
          <li>妥善保管账户密码和访问凭证，对账户下所有活动负责</li>
          <li>不得利用本平台从事任何违法违规活动</li>
          <li>不得干扰、破坏本平台的正常运营</li>
          <li>不得尝试未经授权访问本平台的系统或数据</li>
          <li>及时更新账户信息，确保信息的准确性和完整性</li>
        </ul>

        <h2>三、免责声明</h2>
        <p>本平台提供的所有数据、分析和建议仅供参考，不构成任何投资建议或承诺。投资者应基于自身判断做出投资决策，并承担相应风险。本平台不对以下情况承担责任：</p>
        <ul>
          <li>基于本平台建议或信息做出的投资决策导致的损失</li>
          <li>因不可抗力、系统故障、第三方服务中断导致的服务异常</li>
          <li>用户自身操作失误或违反本条款导致的损失</li>
          <li>第三方通过平台传播的信息的准确性和完整性</li>
        </ul>

        <h2>四、服务等级协议（SLA）</h2>
        <p>我们承诺提供以下服务等级：</p>
        <ul>
          <li><strong>可用性：</strong>平台年度可用性不低于99.5%（计划内维护除外）</li>
          <li><strong>响应时间：</strong>API请求平均响应时间不超过500ms，95%请求在2秒内完成</li>
          <li><strong>数据备份：</strong>每日自动备份，数据保留至少30天</li>
          <li><strong>技术支持：</strong>工作日8:00-20:00提供技术支持，紧急问题4小时内响应</li>
          <li><strong>维护通知：</strong>计划内维护至少提前24小时公告</li>
        </ul>

        <h2>五、知识产权</h2>
        <p>本平台的所有内容，包括但不限于软件、算法、设计、文字、图表、标识等，均归NeuroCashEngine或其许可方所有，受著作权法、商标法等法律保护。未经书面许可，不得复制、修改、分发或创建衍生作品。</p>

        <h2>六、账户终止</h2>
        <p>用户可随时申请注销账户。在以下情况下，本平台有权暂停或终止您的账户：</p>
        <ul>
          <li>违反本服务条款的任何规定</li>
          <li>从事欺诈或非法活动</li>
          <li>长期不活跃（连续180天未登录）</li>
          <li>法律法规或监管要求</li>
        </ul>

        <h2>七、争议解决</h2>
        <p>本条款适用中华人民共和国法律。因本条款引起的或与之相关的争议，双方应首先友好协商解决；协商不成的，提交北京市海淀区人民法院管辖。</p>

        <h2>八、条款变更</h2>
        <p>本平台保留修改本条款的权利。重大变更将通过平台公告或邮件提前30天通知。修改后的条款自公告之日起生效。继续使用本平台服务视为接受修改后的条款。</p>

        <h2>九、联系我们</h2>
        <p>如有任何疑问或意见，请联系：</p>
        <p>邮箱：legal@neurocashengine.com</p>
        <p>电话：400-000-0000</p>
      </div>
    </div>
  );
}
