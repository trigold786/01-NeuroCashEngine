# NeuroCashEngine MVP 迭代计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成PRD中MVP定义的C端基础功能和B端核心现金流管理功能，达到约50%的完成度

**Architecture:** 基于现有微服务架构，在cash-flow-engine中扩展资产账户字段，在content-hub中增强资讯字段，前端统一展示

**Tech Stack:** NestJS + TypeORM + React + Zustand + PostgreSQL

---

## 迭代概览

| Phase | 周期 | 目标 | 完成率提升 |
|-------|------|------|-----------|
| **Phase 1** | 2-3周 | C端基础功能完善（资产参数 + 资讯详情 + Dashboard卡片） | +15% |
| **Phase 2** | 1-2周 | B端功能增强（事件标注 + SOP导出） | +8% |
| **Phase 3** | 2周 | C端增值服务探索（投资策略页面） | +5% |
| **Phase 4** | 2周 | 数据产品API（情绪指数） | +5% |
| **总计** | 7-9周 | - | **~33% → ~67%** |

---

## Phase 1: C端基础功能完善

### 任务 1.1: 资产账户参数扩展

**Files:**
- Create: `backend/core/cash-flow-engine/src/entities/UserAssetAccount.entity.ts` (修改)
- Modify: `backend/core/cash-flow-engine/src/dto/CreateAssetAccount.dto.ts`
- Modify: `backend/core/cash-flow-engine/src/controllers/AssetController.ts`
- Modify: `backend/core/cash-flow-engine/src/services/AssetService.ts`
- Modify: `frontend/shared/src/types/index.ts`
- Modify: `frontend/apps/pwa/src/pages/AssetOverview.tsx`
- Test: `backend/core/cash-flow-engine/src/services/AssetService.spec.ts`
- Test: `frontend/apps/pwa/src/pages/AssetOverview.spec.tsx`

**AssetAccountType 扩展字段对照:**

| 类型 | 新增字段 | 类型 | 说明 |
|------|----------|------|------|
| **CASH** | accountName | VARCHAR(128) | 账户名称 |
| **CASH** | institutionCode | VARCHAR(64) | 机构代码 |
| **DEPOSIT** | accountName | VARCHAR(128) | 账户名称 |
| **DEPOSIT** | institutionCode | VARCHAR(64) | 机构代码 |
| **DEPOSIT** | termYears | INT | 存款年限 |
| **DEPOSIT** | interestRate | DECIMAL(8,4) | 年利率 |
| **DEPOSIT** | startDate | DATE | 存款起始日 |
| **DEPOSIT** | endDate | DATE | 存款到期日 |
| **FUND** | accountName | VARCHAR(128) | 账户名称 |
| **FUND** | institutionCode | VARCHAR(64) | 机构代码 |
| **FUND** | fundCode | VARCHAR(32) | 基金代码 |
| **FUND** | fundName | VARCHAR(128) | 基金名称 |
| **FUND** | buyPrice | DECIMAL(18,4) | 买入价 |
| **FUND** | buyDate | DATE | 买入日期 |
| **FUND** | shareCount | DECIMAL(18,4) | 持有份额 |
| **FUND** | nav | DECIMAL(18,4) | 基金净值 |
| **STOCK** | accountName | VARCHAR(128) | 账户名称 |
| **STOCK** | institutionCode | VARCHAR(64) | 机构代码 |
| **STOCK** | stockCode | VARCHAR(32) | 股票代码 |
| **STOCK** | stockName | VARCHAR(128) | 股票名称 |
| **STOCK** | buyPrice | DECIMAL(18,4) | 买入价 |
| **STOCK** | buyDate | DATE | 买入日期 |
| **STOCK** | shareCount | DECIMAL(18,4) | 持仓数量 |
| **STOCK** | currentPrice | DECIMAL(18,4) | 当前股价 |

**Backend Tasks:**

- [ ] **Step 1: 扩展 UserAssetAccount 实体**

```typescript
// backend/core/cash-flow-engine/src/entities/UserAssetAccount.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AssetAccountType {
  CASH = 0,
  DEPOSIT = 1,
  FUND = 2,
  STOCK = 3,
}

@Entity('nce_user_asset_accounts')
export class UserAssetAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 36 })
  userId: string;

  @Column({ type: 'enum', enum: AssetAccountType })
  accountType: AssetAccountType;

  @Column({ length: 64, nullable: true })
  institutionCode: string;

  @Column({ length: 128, nullable: true })
  accountName: string;

  @Column('decimal', { precision: 18, scale: 2 })
  balance: number;

  @Column({ length: 8, default: 'CNY' })
  currency: string;

  @Column({ type: 'int', default: 2 })
  authStatus: number;

  @Column({ type: 'timestamp', nullable: true })
  lastSyncTime: Date;

  // DEPOSIT 专用字段
  @Column({ type: 'int', nullable: true })
  termYears: number;

  @Column('decimal', { precision: 8, scale: 4, nullable: true })
  interestRate: number;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  // FUND 专用字段
  @Column({ length: 32, nullable: true })
  fundCode: string;

  @Column({ length: 128, nullable: true })
  fundName: string;

  @Column('decimal', { precision: 18, scale: 4, nullable: true })
  buyPrice: number;

  @Column({ type: 'date', nullable: true })
  buyDate: Date;

  @Column('decimal', { precision: 18, scale: 4, nullable: true })
  shareCount: number;

  @Column('decimal', { precision: 18, scale: 4, nullable: true })
  nav: number;

  // STOCK 专用字段
  @Column({ length: 32, nullable: true })
  stockCode: string;

  @Column({ length: 128, nullable: true })
  stockName: string;

  @Column('decimal', { precision: 18, scale: 4, nullable: true })
  currentPrice: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

- [ ] **Step 2: 创建 CreateAssetAccountDto**

```typescript
// backend/core/cash-flow-engine/src/dto/CreateAssetAccount.dto.ts
import { IsEnum, IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';
import { AssetAccountType } from '../entities/UserAssetAccount.entity';

export class CreateAssetAccountDto {
  @IsEnum(AssetAccountType)
  accountType: AssetAccountType;

  @IsOptional()
  @IsString()
  institutionCode?: string;

  @IsOptional()
  @IsString()
  accountName?: string;

  @IsNumber()
  balance: number;

  @IsOptional()
  @IsString()
  currency?: string;

  // DEPOSIT fields
  @IsOptional()
  @IsNumber()
  termYears?: number;

  @IsOptional()
  @IsNumber()
  interestRate?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  // FUND fields
  @IsOptional()
  @IsString()
  fundCode?: string;

  @IsOptional()
  @IsString()
  fundName?: string;

  @IsOptional()
  @IsNumber()
  buyPrice?: number;

  @IsOptional()
  @IsDateString()
  buyDate?: string;

  @IsOptional()
  @IsNumber()
  shareCount?: number;

  @IsOptional()
  @IsNumber()
  nav?: number;

  // STOCK fields
  @IsOptional()
  @IsString()
  stockCode?: string;

  @IsOptional()
  @IsString()
  stockName?: string;

  @IsOptional()
  @IsNumber()
  currentPrice?: number;
}
```

- [ ] **Step 3: 更新 AssetController 处理新字段**

```typescript
// backend/core/cash-flow-engine/src/controllers/AssetController.ts
@Post('accounts')
async createAccount(@Body() dto: CreateAssetAccountDto, @CurrentUserId() userId: string) {
  return this.assetService.createAccount(userId, dto);
}

@Get('accounts')
async getAccounts(@CurrentUserId() userId: string) {
  return this.assetService.getAccounts(userId);
}
```

- [ ] **Step 4: 更新 AssetService**

```typescript
// backend/core/cash-flow-engine/src/services/AssetService.ts
async createAccount(userId: string, dto: CreateAssetAccountDto) {
  const account = this.accountRepository.create({
    userId,
    ...dto,
  });
  return this.accountRepository.save(account);
}

async getAccounts(userId: string) {
  return this.accountRepository.find({ where: { userId } });
}
```

**Frontend Tasks:**

- [ ] **Step 5: 更新前端类型定义**

```typescript
// frontend/shared/src/types/index.ts
export type AssetAccountType = 'CASH' | 'DEPOSIT' | 'FUND' | 'STOCK';

export interface UserAssetAccount {
  id: string;
  userId: string;
  accountType: AssetAccountType;
  institutionCode?: string;
  accountName?: string;
  balance: number;
  currency: string;
  authStatus: number;
  lastSyncTime?: Date;
  // DEPOSIT
  termYears?: number;
  interestRate?: number;
  startDate?: Date;
  endDate?: Date;
  // FUND
  fundCode?: string;
  fundName?: string;
  buyPrice?: number;
  buyDate?: Date;
  shareCount?: number;
  nav?: number;
  // STOCK
  stockCode?: string;
  stockName?: number;
  currentPrice?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

- [ ] **Step 6: 更新 AssetOverview.tsx 添加账户表单**

```tsx
// frontend/apps/pwa/src/pages/AssetOverview.tsx
// 添加动态表单，根据accountType显示不同字段

const renderAccountFields = () => {
  switch (newAccount.accountType) {
    case 'DEPOSIT':
      return (
        <>
          <input placeholder="存款年限" type="number" value={newAccount.termYears || ''}
            onChange={(e) => setNewAccount({...newAccount, termYears: Number(e.target.value)})} />
          <input placeholder="年利率 (%)" type="number" step="0.01" value={newAccount.interestRate || ''}
            onChange={(e) => setNewAccount({...newAccount, interestRate: Number(e.target.value)})} />
          <input placeholder="存款起始日" type="date" value={newAccount.startDate || ''}
            onChange={(e) => setNewAccount({...newAccount, startDate: e.target.value})} />
          <input placeholder="存款到期日" type="date" value={newAccount.endDate || ''}
            onChange={(e) => setNewAccount({...newAccount, endDate: e.target.value})} />
        </>
      );
    case 'FUND':
      return (
        <>
          <input placeholder="基金代码" value={newAccount.fundCode || ''}
            onChange={(e) => setNewAccount({...newAccount, fundCode: e.target.value})} />
          <input placeholder="基金名称" value={newAccount.fundName || ''}
            onChange={(e) => setNewAccount({...newAccount, fundName: e.target.value})} />
          <input placeholder="买入价" type="number" step="0.001" value={newAccount.buyPrice || ''}
            onChange={(e) => setNewAccount({...newAccount, buyPrice: Number(e.target.value)})} />
          <input placeholder="买入日期" type="date" value={newAccount.buyDate || ''}
            onChange={(e) => setNewAccount({...newAccount, buyDate: e.target.value})} />
          <input placeholder="持有份额" type="number" step="0.01" value={newAccount.shareCount || ''}
            onChange={(e) => setNewAccount({...newAccount, shareCount: Number(e.target.value)})} />
        </>
      );
    case 'STOCK':
      return (
        <>
          <input placeholder="股票代码" value={newAccount.stockCode || ''}
            onChange={(e) => setNewAccount({...newAccount, stockCode: e.target.value})} />
          <input placeholder="股票名称" value={newAccount.stockName || ''}
            onChange={(e) => setNewAccount({...newAccount, stockName: e.target.value})} />
          <input placeholder="买入价" type="number" step="0.01" value={newAccount.buyPrice || ''}
            onChange={(e) => setNewAccount({...newAccount, buyPrice: Number(e.target.value)})} />
          <input placeholder="买入日期" type="date" value={newAccount.buyDate || ''}
            onChange={(e) => setNewAccount({...newAccount, buyDate: e.target.value})} />
          <input placeholder="持仓数量" type="number" value={newAccount.shareCount || ''}
            onChange={(e) => setNewAccount({...newAccount, shareCount: Number(e.target.value)})} />
          <input placeholder="当前股价" type="number" step="0.01" value={newAccount.currentPrice || ''}
            onChange={(e) => setNewAccount({...newAccount, currentPrice: Number(e.target.value)})} />
        </>
      );
    default:
      return null;
  }
};
```

- [ ] **Step 7: 更新账户列表展示**

```tsx
// 在账户列表中根据accountType显示不同字段
{acc.accountType === 'DEPOSIT' && acc.interestRate && (
  <span>利率: {acc.interestRate}%</span>
)}
{acc.accountType === 'STOCK' && acc.stockCode && (
  <span>{acc.stockCode} 持仓:{acc.shareCount}股</span>
)}
```

**Testing:**

- [ ] **Step 8: 编写后端测试**

```typescript
// backend/core/cash-flow-engine/src/services/AssetService.spec.ts
describe('createAccount', () => {
  it('should create a DEPOSIT account with all fields', async () => {
    const dto = {
      accountType: AssetAccountType.DEPOSIT,
      accountName: '建设银行定期',
      institutionCode: 'CCB',
      balance: 50000,
      termYears: 1,
      interestRate: 2.15,
      startDate: '2024-01-01',
      endDate: '2025-01-01',
    };
    const result = await service.createAccount(userId, dto);
    expect(result.termYears).toBe(1);
    expect(result.interestRate).toBe(2.15);
  });
});
```

- [ ] **Step 9: 编写前端测试**

```tsx
// frontend/apps/pwa/src/pages/AssetOverview.spec.tsx
it('should show deposit fields when selecting DEPOSIT type', async () => {
  render(<AssetOverview />);
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'DEPOSIT' } });
  expect(screen.getByPlaceholderText('存款年限')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('年利率 (%)')).toBeInTheDocument();
});
```

- [ ] **Step 10: 提交代码**

```bash
git add .
git commit -m "feat: 扩展资产账户参数支持DEPOSIT/FUND/STOCK详细字段"
```

---

### 任务 1.2: 资讯详情增强

**Files:**
- Modify: `backend/core/content-hub/src/entities/News.entity.ts`
- Modify: `backend/core/content-hub/src/dto/CreateNews.dto.ts`
- Modify: `backend/core/content-hub/src/services/NewsService.ts`
- Modify: `frontend/shared/src/types/index.ts`
- Modify: `frontend/apps/pwa/src/pages/NewsList.tsx`
- Modify: `frontend/apps/pwa/src/pages/NewsDetail.tsx`
- Test: `backend/core/content-hub/src/services/NewsService.spec.ts`

**新增字段:**

| 字段 | 类型 | 说明 |
|------|------|------|
| sourceUrl | VARCHAR(512) | 资讯原文链接 |
| publishTime | DATETIME | 发布时间 |
| author | VARCHAR(128) | 作者/来源记者 |

**Backend Tasks:**

- [ ] **Step 1: 扩展 News 实体**

```typescript
// backend/core/content-hub/src/entities/News.entity.ts
@Entity('nce_news')
export class News {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 256 })
  title: string;

  @Column('text')
  content: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'enum', enum: NewsCategory })
  category: NewsCategory;

  @Column({ type: 'enum', enum: NewsSourceType })
  sourceType: NewsSourceType;

  @Column({ length: 128 })
  sourceName: string;

  @Column({ length: 512, nullable: true })
  sourceUrl: string;

  @Column({ length: 128, nullable: true })
  author: string;

  @Column({ type: 'datetime', nullable: true })
  publishTime: Date;

  @Column({ length: 256, nullable: true })
  sourceUrl: string;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: false })
  isVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

- [ ] **Step 2: 创建 NewsseedData 包含完整字段**

```typescript
// backend/core/content-hub/src/seed/news.seed.ts
export const newsSeedData = [
  {
    title: '央行发布2024年货币政策报告',
    content: '央行货币政策报告指出...',
    summary: '央行发布2024年货币政策报告',
    category: NewsCategory.MACRO,
    sourceType: NewsSourceType.OFFICIAL,
    sourceName: '中国人民银行',
    sourceUrl: 'https://www.pbc.gov.cn/...',
    author: '央行研究局',
    publishTime: new Date('2024-01-15T10:00:00Z'),
  },
  // ... 更多种子数据
];
```

**Frontend Tasks:**

- [ ] **Step 3: 更新前端类型**

```typescript
// frontend/shared/src/types/index.ts
export interface News {
  id: string;
  title: string;
  content: string;
  summary?: string;
  category: NewsCategory;
  sourceType: NewsSourceType;
  sourceName: string;
  sourceUrl?: string;
  author?: string;
  publishTime?: Date;
  viewCount: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

- [ ] **Step 4: 更新 NewsList 显示来源和时间**

```tsx
// frontend/apps/pwa/src/pages/NewsList.tsx
<div style={{ display: 'flex', justifyContent: 'space-between', color: '#999', fontSize: '12px' }}>
  <span>{news.sourceName} {news.author && `· ${news.author}`}</span>
  <span>{news.publishTime ? new Date(news.publishTime).toLocaleDateString('zh-CN') : ''} {news.viewCount} 阅读</span>
</div>
```

- [ ] **Step 5: 更新 NewsDetail 显示完整来源**

```tsx
// frontend/apps/pwa/src/pages/NewsDetail.tsx
<div className="source-info">
  <a href={news.sourceUrl} target="_blank" rel="noopener noreferrer">
    来源: {news.sourceName}
          </a>
  {news.author && <span> 作者: {news.author}</span>}
  {news.publishTime && <span> 发布时间: {new Date(news.publishTime).toLocaleString()}</span>}
</div>
```

- [ ] **Step 6: 提交代码**

```bash
git add .
git commit -m "feat: 增强资讯详情支持sourceUrl/author/publishTime"
```

---

### 任务 1.3: Dashboard 统计卡片

**Files:**
- Modify: `frontend/apps/pwa/src/pages/Dashboard.tsx`
- Modify: `frontend/shared/src/api/asset.ts`
- Modify: `frontend/shared/src/store/asset.store.ts`
- Test: `frontend/apps/pwa/src/pages/Dashboard.spec.tsx`

**PRD要求:**
- 总资产(脱敏/明文切换)
- 昨日收益
- 累计收益

**Frontend Tasks:**

- [ ] **Step 1: 计算收益数据**

```tsx
// frontend/apps/pwa/src/pages/Dashboard.tsx
const calculateReturns = () => {
  const accounts = assetStore.accounts;
  let totalAsset = 0;
  let totalCost = 0;

  accounts.forEach(acc => {
    totalAsset += acc.balance;
    if (acc.buyPrice && acc.shareCount) {
      totalCost += acc.buyPrice * acc.shareCount;
    }
  });

  const totalReturn = totalAsset - totalCost;
  const yesterdayReturn = totalReturn * 0.01; // 模拟昨日收益
  const cumulativeReturn = totalReturn;

  return { totalAsset, yesterdayReturn, cumulativeReturn };
};
```

- [ ] **Step 2: 添加统计卡片UI**

```tsx
// frontend/apps/pwa/src/pages/Dashboard.tsx
<div style={{
  background: 'white',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  marginBottom: '24px',
  display: 'flex',
  justifyContent: 'space-around'
}}>
  <div style={{ textAlign: 'center' }}>
    <p style={{ color: '#666', fontSize: '14px', margin: '0 0 8px 0' }}>总资产</p>
    <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#0066cc', margin: 0 }}>
      ¥{totalAsset.toLocaleString()}
    </p>
  </div>
  <div style={{ textAlign: 'center' }}>
    <p style={{ color: '#666', fontSize: '14px', margin: '0 0 8px 0' }}>昨日收益</p>
    <p style={{ fontSize: '28px', fontWeight: 'bold', color: yesterdayReturn >= 0 ? '#cc0000' : '#00cc66', margin: 0 }}>
      {yesterdayReturn >= 0 ? '+' : ''}{yesterdayReturn.toLocaleString()}
    </p>
  </div>
  <div style={{ textAlign: 'center' }}>
    <p style={{ color: '#666', fontSize: '14px', margin: '0 0 8px 0' }}>累计收益</p>
    <p style={{ fontSize: '28px', fontWeight: 'bold', color: cumulativeReturn >= 0 ? '#cc0000' : '#00cc66', margin: 0 }}>
      {cumulativeReturn >= 0 ? '+' : ''}{cumulativeReturn.toLocaleString()}
    </p>
  </div>
</div>
```

- [ ] **Step 3: 添加脱敏切换功能**

```tsx
const [isMasked, setIsMasked] = useState(false);

const displayAmount = (amount: number) => {
  if (isMasked) return '***';
  return amount.toLocaleString();
};

<button onClick={() => setIsMasked(!isMasked)}>
  {isMasked ? '显示金额' : '隐藏金额'}
</button>
```

- [ ] **Step 4: 提交代码**

```bash
git add .
git commit -m "feat: Dashboard添加统计卡片(总资产/昨日收益/累计收益/脱敏切换)"
```

---

## Phase 2: B端功能增强

### 任务 2.1: 现金流图表事件标注

**Files:**
- Create: `backend/core/cash-flow-engine/src/entities/CashFlowEvent.entity.ts`
- Modify: `backend/core/cash-flow-engine/src/controllers/BusinessCashFlowController.ts`
- Modify: `backend/core/cash-flow-engine/src/services/BusinessCashFlowService.ts`
- Modify: `frontend/apps/pwa/src/pages/BusinessCashFlow.tsx`
- Test: `backend/core/cash-flow-engine/src/services/BusinessCashFlowService.spec.ts`

**新增实体:**

```typescript
// backend/core/cash-flow-engine/src/entities/CashFlowEvent.entity.ts
export enum EventType {
  TAX_DUE = 'TAX_DUE',      // 税费缴纳
  PAYDAY = 'PAYDAY',        // 发薪日
  CONTRACT_PAYMENT = 'CONTRACT_PAYMENT',  // 合同付款
  LOAN_DUE = 'LOAN_DUE',    // 贷款到期
  RECEIVABLE_DUE = 'RECEIVABLE_DUE',      // 应收账款到期
}

@Entity('nce_cash_flow_events')
export class CashFlowEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 36 })
  userId: string;

  @Column({ type: 'enum', enum: EventType })
  eventType: EventType;

  @Column({ type: 'date' })
  eventDate: Date;

  @Column('decimal', { precision: 18, scale: 2 })
  amount: number;

  @Column({ length: 256, nullable: true })
  description: string;
}
```

**Frontend Tasks:**

- [ ] **Step 1: 更新图表组件添加事件标注**

```tsx
// frontend/apps/pwa/src/pages/BusinessCashFlow.tsx
const chartData = {
  labels: forecasts.map(f => f.forecastDate),
  datasets: [
    {
      label: '预测余额',
      data: forecasts.map(f => Number(f.predictedBalance)),
      // ... existing config
    },
  ],
  annotation: events.map(e => ({
    type: 'line',
    xMin: e.eventDate,
    xMax: e.eventDate,
    borderColor: '#cc6600',
    borderWidth: 2,
    label: {
      content: e.eventType,
      enabled: true,
    },
  })),
};
```

- [ ] **Step 2: 提交代码**

```bash
git add .
git commit -m "feat: 现金流图表支持事件标注(税期/发薪日等)"
```

---

### 任务 2.2: SOP智能填充和导出

**Files:**
- Create: `backend/core/cash-flow-engine/src/services/SopExportService.ts`
- Modify: `backend/core/cash-flow-engine/src/controllers/BusinessCashFlowController.ts`
- Modify: `backend/core/cash-flow-engine/src/services/BusinessCashFlowService.ts`
- Modify: `frontend/apps/pwa/src/pages/BusinessSopDetail.tsx`
- Test: `frontend/apps/pwa/src/pages/BusinessSopDetail.spec.tsx`

**Backend Tasks:**

- [ ] **Step 1: 创建 SopExportService**

```typescript
// backend/core/cash-flow-engine/src/services/SopExportService.ts
import * as pdfMake from 'pdfmake/build/pdfmake';

export class SopExportService {
  generatePdf(sop: GeneratedSop, forecast: CashFlowForecast): Promise<Buffer> {
    const docDefinition = {
      content: [
        { text: sop.title, style: 'header' },
        { text: `生成时间: ${new Date().toLocaleString()}`, style: 'subheader' },
        { text: `预测日期: ${forecast.forecastDate}`, style: 'subheader' },
        { text: `预测余额: ¥${forecast.predictedBalance.toLocaleString()}`, style: 'subheader' },
        { text: '\n' },
        { text: 'SOP内容:', style: 'header' },
        { text: sop.content },
      ],
      styles: {
        header: { fontSize: 18, bold: true },
        subheader: { fontSize: 12, color: '#666' },
      },
    };

    return new Promise((resolve, reject) => {
      const pdfDoc = pdfMake.createPdf(docDefinition);
      pdfDoc.getBuffer((buffer: Buffer) => {
        resolve(buffer);
      });
    });
  }

  generateMarkdown(sop: GeneratedSop, forecast: CashFlowForecast): string {
    return `# ${sop.title}

## 基本信息
- 生成时间: ${new Date().toLocaleString()}
- 预测日期: ${forecast.forecastDate}
- 预测余额: ¥${forecast.predictedBalance.toLocaleString()}

## SOP内容
${sop.content}
`;
  }
}
```

- [ ] **Step 2: 更新 BusinessCashFlowService.generateSop 自动填充**

```typescript
// 在generateSop中自动填充预测相关信息
async generateSop(userId: string, dto: GenerateSopDto): Promise<GeneratedSop> {
  const latestForecast = await this.forecastRepository.findOne({
    where: { userId },
    order: { forecastDate: 'DESC' },
  });

  const template = await this.templateRepository.findOne({
    where: { type: dto.type || SopType.SHORTAGE, isActive: true },
  });

  // 智能填充：将预测金额和日期注入SOP
  let content = template.content;
  if (latestForecast) {
    content = content
      .replace('{{predictedBalance}}', latestForecast.predictedBalance.toString())
      .replace('{{forecastDate}}', latestForecast.forecastDate)
      .replace('{{alertDate}}', this.calculateAlertDate(latestForecast));
  }

  const generatedSop = this.generatedSopRepository.create({
    userId,
    templateId: template.templateId,
    title: dto.title || template.title,
    content,
  });

  return await this.generatedSopRepository.save(generatedSop);
}
```

**Frontend Tasks:**

- [ ] **Step 3: 更新 BusinessSopDetail 添加导出按钮**

```tsx
// frontend/apps/pwa/src/pages/BusinessSopDetail.tsx
<div style={{ display: 'flex', gap: '12px' }}>
  <button onClick={() => exportSop('pdf')} style={{ padding: '10px 20px' }}>
    导出PDF
  </button>
  <button onClick={() => exportSop('markdown')} style={{ padding: '10px 20px' }}>
    复制内容
  </button>
</div>

const exportSop = async (format: 'pdf' | 'markdown') => {
  if (format === 'pdf') {
    const response = await sopApi.exportPdf(sopId);
    // 下载PDF
  } else {
    navigator.clipboard.writeText(sop.content);
    alert('已复制到剪贴板');
  }
};
```

- [ ] **Step 4: 提交代码**

```bash
git add .
git commit -m "feat: SOP智能填充和PDF/Markdown导出功能"
```

---

## Phase 3: C端增值服务探索

### 任务 3.1: 投资策略页面

**Files:**
- Create: `frontend/apps/pwa/src/pages/Strategy.tsx`
- Create: `backend/core/cash-flow-engine/src/controllers/StrategyController.ts`
- Create: `backend/core/cash-flow-engine/src/services/StrategyService.ts`
- Modify: `frontend/apps/pwa/src/App.tsx`
- Modify: `frontend/shared/src/types/index.ts`
- Test: `frontend/apps/pwa/src/pages/Strategy.spec.tsx`

**PRD要求:**
- 风险偏好评估问卷
- 基于MPT模型的资产配置建议
- 具体投资标的推荐

**Backend Tasks:**

- [ ] **Step 1: 创建 StrategyController**

```typescript
// backend/core/cash-flow-engine/src/controllers/StrategyController.ts
@Controller('strategy')
export class StrategyController {
  constructor(private readonly strategyService: StrategyService) {}

  @Post('recommend')
  async getRecommendation(@Body() profile: RiskProfileDto) {
    return this.strategyService.generateRecommendation(profile);
  }

  @Get('products')
  async getProducts(@Query('riskLevel') riskLevel: number) {
    return this.strategyService.getProductsByRiskLevel(riskLevel);
  }
}
```

- [ ] **Step 2: 创建 StrategyService**

```typescript
// backend/core/cash-flow-engine/src/services/StrategyService.ts
@Injectable()
export class StrategyService {
  generateRecommendation(profile: RiskProfileDto) {
    // 简化版MPT推荐
    const allocation = {
      conservative: { cash: 20, bond: 50, stock: 20, gold: 10 },
      moderate: { cash: 10, bond: 30, stock: 50, gold: 10 },
      aggressive: { cash: 5, bond: 15, stock: 70, gold: 10 },
    };

    return allocation[profile.riskTolerance] || allocation.moderate;
  }

  getProductsByRiskLevel(riskLevel: number) {
    // 返回符合风险等级的金融产品
    return this.productRepository.find({
      where: { riskLevel: LessThanOrEqual(riskLevel) },
      take: 10,
    });
  }
}
```

**Frontend Tasks:**

- [ ] **Step 3: 创建 Strategy.tsx**

```tsx
// frontend/apps/pwa/src/pages/Strategy.tsx
export default function Strategy() {
  const [step, setStep] = useState(1);
  const [riskProfile, setRiskProfile] = useState({});

  const handleRiskSurveyComplete = (answers) => {
    const profile = calculateRiskProfile(answers);
    setRiskProfile(profile);
    setStep(2);
  };

  const handleGetRecommendation = async () => {
    const recommendation = await strategyApi.getRecommendation(riskProfile);
    setRecommendation(recommendation);
    setStep(3);
  };

  if (step === 1) {
    return <RiskSurvey onComplete={handleRiskSurveyComplete} />;
  }

  if (step === 2) {
    return (
      <div>
        <h2>您的风险画像: {riskProfile.level}</h2>
        <RadarChart data={riskProfile.radarData} />
        <button onClick={handleGetRecommendation}>获取推荐组合</button>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div>
        <h2>资产配置建议</h2>
        <Doughnut data={recommendation.allocation} />
        <h3>推荐产品</h3>
        {recommendation.products.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    );
  }
}
```

- [ ] **Step 4: 更新 App.tsx 添加路由**

```tsx
// frontend/apps/pwa/src/App.tsx
case 'strategy':
  return <Strategy navigateTo={setCurrentPage} />;
```

- [ ] **Step 5: 提交代码**

```bash
git add .
git commit -m "feat: 投资策略页面(风险评估/MPT推荐/产品列表)"
```

---

## Phase 4: 数据产品API

### 任务 4.1: 情绪指数API

**Files:**
- Create: `backend/core/data-product-api/src/controllers/SentimentController.ts`
- Create: `backend/core/data-product-api/src/services/SentimentService.ts`
- Modify: `backend/core/data-product-api/src/app.module.ts`
- Test: `backend/core/data-product-api/src/services/SentimentService.spec.ts`

**PRD要求:**
- C-end Investment Sentiment Index API
- 反映不同资产类别（股、债、金、现）的散户情绪热力与资金流向

**Backend Tasks:**

- [ ] **Step 1: 创建 SentimentService**

```typescript
// backend/core/data-product-api/src/services/SentimentService.ts
@Injectable()
export class SentimentService {
  async getInvestmentSentiment(): Promise<InvestmentSentiment[]> {
    // 基于用户行为数据计算情绪指数
    const cashRatio = await this.calculateAssetRatio('CASH');
    const depositRatio = await this.calculateAssetRatio('DEPOSIT');
    const fundRatio = await this.calculateAssetRatio('FUND');
    const stockRatio = await this.calculateAssetRatio('STOCK');

    return [
      { date: new Date().toISOString(), assetCategory: 'CASH', sentimentScore: 100 - cashRatio * 100, totalSamples: 1000 },
      { date: new Date().toISOString(), assetCategory: 'DEPOSIT', sentimentScore: 100 - depositRatio * 100, totalSamples: 1000 },
      { date: new Date().toISOString(), assetCategory: 'FUND', sentimentScore: fundRatio * 100, totalSamples: 1000 },
      { date: new Date().toISOString(), assetCategory: 'STOCK', sentimentScore: stockRatio * 100, totalSamples: 1000 },
    ];
  }

  private async calculateAssetRatio(type: string): Promise<number> {
    const total = await this.accountRepository.count();
    const typeCount = await this.accountRepository.count({ where: { accountType: type } });
    return total > 0 ? typeCount / total : 0;
  }
}
```

- [ ] **Step 2: 创建 SentimentController**

```typescript
// backend/core/data-product-api/src/controllers/SentimentController.ts
@Controller('sentiment')
export class SentimentController {
  constructor(private readonly sentimentService: SentimentService) {}

  @Get('investment')
  async getInvestmentSentiment() {
    return {
      success: true,
      data: await this.sentimentService.getInvestmentSentiment(),
    };
  }
}
```

- [ ] **Step 3: 提交代码**

```bash
git add .
git commit -m "feat: 情绪指数API (C-end Investment Sentiment Index)"
```

---

## 测试验证清单

每个Phase完成后需验证:

| Phase | 验证项 | 测试方式 |
|-------|--------|----------|
| 1.1 | 添加DEPOSIT账户带利率和年限 | 手动测试表单提交 |
| 1.1 | 添加STOCK账户带股票代码和买入价 | 手动测试表单提交 |
| 1.1 | 账户列表显示各类型特有字段 | 视觉验证 |
| 1.2 | 资讯列表显示来源和日期 | 视觉验证 |
| 1.2 | 资讯详情显示完整来源信息 | 视觉验证 |
| 1.3 | Dashboard显示总资产/收益统计 | 视觉验证 |
| 1.3 | 脱敏切换功能正常 | 手动测试 |
| 2.1 | 现金流图表显示事件标注 | 视觉验证 |
| 2.2 | SOP详情页有导出按钮 | 视觉验证 |
| 2.2 | PDF导出成功生成文件 | 功能测试 |
| 3.1 | 投资策略页面显示风险问卷 | 手动测试 |
| 3.1 | 问卷完成后显示推荐组合 | 手动测试 |
| 4.1 | GET /sentiment/investment 返回数据 | API测试 |

---

## 风险与依赖

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 前端表单动态字段实现复杂度 | 中 | 使用switch-case分类型渲染 |
| PDF导出库依赖 | 中 | 调研pdfmake vs jspdf |
| MPT算法准确度 | 低 | MVP使用简化版，后续迭代 |
| 数据库迁移 | 高 | 提前编写migration脚本 |

---

**Plan saved to:** `docs/superpowers/plans/2026-05-11-neurocash-engine-mvp-iteration-plan.md`

**Two execution options:**

1. **Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**