# NeuroCashEngine 项目状态报告

## 更新日期
2026-05-13

## 项目阶段
Phase 1-6 完成 ✅ (MVP迭代 ~47% PRD完成率)

---

## 当前状态

### 服务运行状态

| 服务 | 端口 | 状态 | 数据库 |
|------|------|------|--------|
| account-center | 3001 | ✅ 运行中 | PostgreSQL (nce_root/nce_db) |
| cash-flow-engine | 3005 | ✅ 运行中 | PostgreSQL (nce_root/nce_db) |
| content-hub | 3006 | ✅ 运行中 | PostgreSQL (nce_root/nce_db) |
| data-product-api | 3007 | ✅ 运行中 | PostgreSQL (nce_root/nce_db) |
| PostgreSQL (nce-postgres) | 5432 | ✅ 运行中 | - |
| Frontend (PWA) | 5173 | ✅ 运行中 | - |

### 测试状态

| 测试类型 | 数量 | 状态 |
|---------|------|------|
| 后端单元测试 (cash-flow-engine) | 84 | ✅ 全部通过 |
| 后端单元测试 (data-product-api) | 19 | ✅ 全部通过 |
| 前端单元测试 (PWA) | 12 | ✅ 全部通过 |

---

## Phase 3: JWT 认证集成 ✅

### 完成的功能
1. **JwtAuthGuard** - 在 cash-flow-engine 中添加了 JWT 认证守卫
2. **AssetController 认证** - 所有 `/assets/*` 端点现在需要 JWT 认证

---

## Phase 4: 前端 UI 开发 ✅

### 已完成页面
- `Login.tsx` - 用户登录页面
- `Register.tsx` - 用户注册页面
- `Dashboard.tsx` - 控制台主页 (含统计卡片+脱敏切换)
- `AssetOverview.tsx` - 资产概览页面 (含Doughnut图表+按类型动态表单)
- `BusinessCashFlow.tsx` - 商业现金流页面 (含预测折线图+事件标注)
- `BusinessSopList.tsx` - SOP 列表页面
- `BusinessSopDetail.tsx` - SOP 详情页面 (含导出PDF/复制Markdown)
- `NewsList.tsx` - 新闻列表页面 (含搜索+sourceUrl/author展示)
- `NewsDetail.tsx` - 新闻详情页面 (含来源信息+发布时间)
- `Strategy.tsx` - 投资策略页面 (三步向导:风险问卷→MPT分配→产品列表)

### 状态管理 (Zustand)
- `auth.store.ts` - 认证状态管理
- `asset.store.ts` - 资产状态管理
- `business.store.ts` - 商业现金流状态管理 (含forecast/SOP/events)
- `news.store.ts` - 新闻状态管理

---

## Phase 5: 生产环境部署配置 ✅

### Docker Compose
- 服务: postgres, redis, account-center, cash-flow-engine, content-hub, data-product-api, frontend

---

## Phase 6: MVP迭代开发 (7个Task)

### Task 1.1: 资产账户参数扩展 ✅
- UserAssetAccount扩展DEPOSIT/FUND/STOCK专属字段
- Coin: `83ef2d5`

### Task 1.2: 资讯详情增强 ✅
- News实体添加sourceUrl/author/publishTime
- Coin: `a4fc62e`

### Task 1.3: Dashboard统计卡片 ✅
- 总资产/昨日收益/累计收益 + 脱敏切换
- Coin: `23ca3fe`

### Task 2.1: 现金流图表事件标注 ✅
- CashFlowEvent实体(TAX_DUE/PAYDAY/CONTRACT_PAYMENT等)
- BusinessCashFlow.tsx事件标记线
- Coin: `7594a50`

### Task 2.2: SOP智能填充和导出 ✅
- generateSop自动填充{{predictedBalance}}等占位符
- SopExportService.generateMarkdown/generatePdf
- Coin: `c29beb3`

### Task 3.1: 投资策略页面 ✅
- 5题风险评估问卷→MPT推荐→产品列表
- Coin: `c621e19`

### Task 4.1: 情绪指数API ✅
- GET /sentiment/investment (CASH/DEPOSIT/FUND/STOCK)
- N+1查询优化(8次→2次批量)
- Coin: `5bfd1b8`

### 代码质量优化
- SOP模板占位符修复 (SHORTAGE+SURPLUS)
- generateForecast事务保护 (dataSource.transaction)
- SentimentService批量查询优化
- Coin: `096d71b`, `48b0bf6`

---

## API 端点汇总

### account-center (3001)
| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | /auth/register | 用户注册 | 否 |
| POST | /auth/login | 用户登录 | 否 |
| GET | / | 健康检查 | 否 |

### cash-flow-engine (3005)
| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | /assets/overview | 资产概览 | JWT |
| GET | /assets/accounts | 账户列表 | JWT |
| POST | /assets/accounts | 创建账户 | JWT |
| DELETE | /assets/accounts/:id | 删除账户 | JWT |
| GET | /cashflow/records | 现金流记录 | JWT |
| POST | /cashflow/records | 创建记录 | JWT |
| POST | /business/cashflow/forecast | 生成预测 | JWT |
| GET | /business/cashflow/forecast | 获取预测 | JWT |
| POST | /business/cashflow/sop | 生成SOP | JWT |
| GET | /business/cashflow/sop | SOP列表 | JWT |
| GET | /business/cashflow/sop/:id | SOP详情 | JWT |
| DELETE | /business/cashflow/sop/:id | 删除SOP | JWT |
| GET | /business/cashflow/sop/:id/export/pdf | 导出PDF | JWT |
| GET | /business/cashflow/sop/:id/export/markdown | 导出Markdown | JWT |
| GET | /business/cashflow/industries | 行业列表 | 否 |
| GET | /business/cashflow/events | 事件列表 | JWT |
| POST | /business/cashflow/events | 创建事件 | JWT |
| POST | /business/cashflow/events/seed | 初始化事件 | JWT |
| POST | /strategy/recommend | MPT推荐 | JWT |
| GET | /strategy/products?riskLevel=X | 产品列表 | JWT |
| POST | /strategy/risk-score | 风险评分 | JWT |

### content-hub (3006)
| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | /news/categories | 新闻分类 | 否 |
| GET | /news | 新闻列表 | 否 |
| GET | /news/:id | 新闻详情 | 否 |

### data-product-api (3007)
| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | /api/health | 健康检查 | 否 |
| GET | /api/investment-sentiment | 投资情绪 | 否 |
| GET | /api/investment-sentiment/latest | 最新情绪概览 | 否 |
| GET | /sentiment/investment | C端投资情绪指数 | 否 |

---

## 已修复问题 (历史)

### 1. AccountType枚举值大小写
- **修复**: 'INDIVIDUAL' → 'individual'

### 2. App.tsx登录后导航
- **修复**: 添加useEffect监听isAuthenticated变化

### 3. 数据库用户名变更
- **修复**: postgres → nce_root

### 4. SOP模板占位符缺失
- **修复**: 模板内容添加{{predictedBalance}}等占位符

### 5. generateForecast无事务保护
- **修复**: 使用dataSource.transaction包裹delete+save

### 6. SentimentService N+1查询
- **修复**: 8次查询优化为2次批量查询

---

## PRD完成度统计

| 分类 | 完成率 |
|------|--------|
| 架构设计 | 50.0% |
| C端基础功能 | 82.1% |
| B端现金流管理 | 78.3% |
| MVP范围 | 87.5% |
| 交互原型 | 48.0% |
| 数据字典 | 63.2% |
| **总计** | **47.4%** |

---

## 剩余待办

1. **C端增值服务** (18.8%) - 交叉验证资讯/高级投资标的/交易方案
2. **B端投资管理** (0%) - 企业风险评估/投资建议/组合监控
3. **数据产品API** (15.4%) - B端现金流速度API/区域消费指数API/NSI协同
4. **多端覆盖** (16.7%) - iOS/Android/微信小程序
5. **商业化** (37.5%) - 订阅制/积分体系/推荐返佣
6. **非功能性需求** (11.1%) - HTTPS/安全审计/性能测试/容灾
7. **视觉设计** (50.0%) - 暗黑模式/品牌色系统/等宽字体

---

## 项目结构
```
backend/
├── core/
│   ├── cash-flow-engine/     # 现金流引擎 (Asset/Forecast/SOP/Event/Strategy)
│   ├── content-hub/          # 内容中心 (News CRUD)
│   └── data-product-api/     # 数据产品API (Sentiment Index)
├── shared/
│   └── account-center/       # 账户中心 (Auth/Login/Register)
docker-compose.yml
frontend/
└── apps/
    └── pwa/                 # React PWA应用
```
