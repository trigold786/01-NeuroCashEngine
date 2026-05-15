# 第三方数据源集成设计文档

**版本：** v1.0  
**日期：** 2026-05-15  
**基于 PRD：** v1.0.0 §3.1.1, §3.1.2, §4.1.1

---

## 1. 概述

为 NeuroCashEngine 接入免费公开的中国金融市场行情数据源，替代现有的静态/种子数据。采用 AKShare + AKTools HTTP API 作为首选数据管道，直连东方财富/新浪 HTTP 接口作为回退（Fallback）。

## 2. 架构设计

```
┌─ cash-flow-engine ──────────────────────────────────────────────┐
│  MarketDataService ─── MarketDataController ─── GET /market/*    │
│    │                                                             │
│    ├─► [Primary] AKTools HTTP API (http://aktools:8080)          │
│    │     股票实时行情 / 基金净值 / 指数 / K线                     │
│    │                                                             │
│    └─► [Fallback] 直连 HTTP 接口                                  │
│          东方财富 quote.eastmoney.com                             │
│          新浪基金 fundgz.sina.com                                 │
│                                                                   │
│    Redis 缓存:  60s (实时行情) / 5min (基金净值) / 1h (K线)       │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴──────────┐
                    ▼                    ▼
          ┌────────────────────┐  ┌──────────────────┐
          │  AKTools (akfamily) │  │  东财/新浪直连     │
          │  Python 3.12       │  │  HTTP Scrape      │
          │  Docker 容器       │  │  (无额外依赖)      │
          │  port 8080         │  └──────────────────┘
          └────────────────────┘
```

## 3. 服务组件

### 3.1 AKTools Docker 服务

新增 `docker-compose.yml` 服务：

```yaml
  aktools:
    image: akfamily/aktools:latest
    container_name: nce-aktools
    expose:
      - "8080"
    restart: unless-stopped
    networks:
      - nce-network
```

通过 Traefik 暴露（无需直接端口映射）。

### 3.2 MarketDataService

位于 `cash-flow-engine`，职责：

- **primary provider**: 通过 HTTP 调用 AKTools API
- **fallback provider**: 直连东财/新浪 HTTP 接口
- **缓存层**: Redis 存储，减少外部调用频率

```typescript
// MarketDataProvider 接口
interface MarketDataProvider {
  getStockRealtime(codes: string[]): Promise<StockQuote[]>;
  getFundNAV(codes: string[]): Promise<FundNAV[]>;
  getIndexRealtime(codes: string[]): Promise<IndexQuote[]>;
  getKLine(code: string, period: string, days: number): Promise<KLineData[]>;
}

// Primary: AktoolsProvider (HTTP → AKTools)
// Fallback: DirectHttpProvider (HTTP → 东财/新浪)
```

### 3.3 MarketDataController

```typescript
@Controller('market')
@UseGuards(JwtAuthGuard)
export class MarketDataController {
  // GET /market/stocks?codes=000001,600519
  // GET /market/funds?codes=110011,000001
  // GET /market/indices?codes=000001,399001
  // GET /market/kline?code=000001&period=daily&days=90
}
```

## 4. AKTools API 调用示例

AKTools 以 HTTP API 暴露 AKShare 的所有数据接口：

```bash
# A股实时行情 (全部沪深京A股)
GET http://aktools:8080/api/public/stock_zh_a_spot_em

# 单只股票历史K线
GET http://aktools:8080/api/public/stock_zh_a_hist?symbol=000001&period=daily

# 开放式基金实时净值
GET http://aktools:8080/api/public/fund_open_fund_daily_em

# ETF基金实时行情
GET http://aktools:8080/api/public/fund_etf_spot_em
```

AKTools 返回 JSON 数组格式，MarketDataService 负责解析和转换。

## 5. 回退 provider 设计

当 AKTools 不可用时（容器未启动或超时），自动切换到直连 HTTP：

```typescript
class FallbackProvider implements MarketDataProvider {
  async getStockRealtime(codes: string[]): Promise<StockQuote[]> {
    // 使用东方财富 HTTP 接口: https://push2.eastmoney.com/api/qt/ulist.np/get?secids=...
    // 或新浪接口: https://hq.sinajs.cn/list=sh000001
  }
}
```

## 6. 缓存策略

| 数据类型 | TTL | 原因 |
|---------|-----|------|
| 股票实时行情 | 60s | 盘中变化快，但不需要秒级刷新 |
| 基金净值 | 5min | 净值每天更新一次即可，但用户可能查询多次 |
| 指数行情 | 60s | 同股票 |
| K线历史数据 | 1h | 历史数据不变 |

## 7. 前端集成

新增 `frontend/shared/src/api/market-data.ts`：

```typescript
const marketClient = axios.create({ baseURL: '/market' });

export const getStockQuotes = (codes: string[]) =>
  marketClient.get('/stocks', { params: { codes: codes.join(',') } });

export const getFundNAVs = (codes: string[]) =>
  marketClient.get('/funds', { params: { codes: codes.join(',') } });

export const getKLine = (code: string, period = 'daily', days = 90) =>
  marketClient.get('/kline', { params: { code, period, days } });
```

前端页面联动：
- `/assets` — 资产详情页显示实时股价/基金净值
- `/strategy` — 产品推荐页显示真实市场数据

## 8. 变更文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `docker-compose.yml` | 修改 | 新增 aktools 服务 |
| `backend/core/cash-flow-engine/src/services/MarketDataService.ts` | 新建 | 主市场数据服务(primary + fallback) |
| `backend/core/cash-flow-engine/src/services/MarketDataService.spec.ts` | 新建 | 单元测试(含 mock) |
| `backend/core/cash-flow-engine/src/services/providers/aktools.provider.ts` | 新建 | AKTools HTTP provider |
| `backend/core/cash-flow-engine/src/services/providers/direct-http.provider.ts` | 新建 | 直连 HTTP fallback provider |
| `backend/core/cash-flow-engine/src/services/providers/provider.interface.ts` | 新建 | MarketDataProvider 接口 |
| `backend/core/cash-flow-engine/src/controllers/MarketDataController.ts` | 新建 | 市场数据 API |
| `backend/core/cash-flow-engine/src/controllers/MarketDataController.spec.ts` | 新建 | 控制器测试 |
| `backend/core/cash-flow-engine/src/app.module.ts` | 修改 | 注册 MarketDataService |
| `frontend/shared/src/api/market-data.ts` | 新建 | 前端 API 客户端 |
| `frontend/shared/src/index.ts` | 修改 | 导出 market-api |

## 9. 不纳入范围

- 东方财富 Choice 付费 API 集成（需单独讨论方案）
- 银行/券商 OAuth 集成（独立子项目）
- 资讯内容爬虫（独立子项目）
- WebSocket 实时推送（REST polling 足够）
