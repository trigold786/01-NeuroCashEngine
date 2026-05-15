# 第三方数据源集成实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 接入免费公开的中国金融市场行情数据 — AKShare/AKTools HTTP API 首选 + 直连东财/新浪 HTTP 回退

**Architecture:** AKTools Python 容器作为数据管道，cash-flow-engine 中新增 MarketDataService 通过 HTTP 调用 AKTools，直连 HTTP 作为回退 provider。Redis 缓存减少外部调用频率。

**Tech Stack:** AKTools (akfamily), NestJS, Redis, TypeScript, Docker Compose

---

## 文件结构

| 文件 | 操作 | 职责 |
|------|------|------|
| `docker-compose.yml` | 修改 | 新增 aktools 服务 |
| `backend/core/cash-flow-engine/src/services/providers/provider.interface.ts` | 新建 | MarketDataProvider 接口定义 |
| `backend/core/cash-flow-engine/src/services/providers/aktools.provider.ts` | 新建 | AKTools HTTP 调用实现 |
| `backend/core/cash-flow-engine/src/services/providers/direct-http.provider.ts` | 新建 | 东财/新浪直连实现 |
| `backend/core/cash-flow-engine/src/services/MarketDataService.ts` | 新建 | 主服务 (路由 + 缓存 + fallback) |
| `backend/core/cash-flow-engine/src/services/MarketDataService.spec.ts` | 新建 | MarketDataService 测试 |
| `backend/core/cash-flow-engine/src/controllers/MarketDataController.ts` | 新建 | 市场数据 API |
| `backend/core/cash-flow-engine/src/controllers/MarketDataController.spec.ts` | 新建 | 控制器测试 |
| `backend/core/cash-flow-engine/src/app.module.ts` | 修改 | 注册 MarketDataService + Controller |
| `frontend/shared/src/api/market-data.ts` | 新建 | 前端 API 客户端 |
| `frontend/shared/src/index.ts` | 修改 | 导出 market-api |

---

### Task 1: AKTools Docker 服务

**Files:**
- Modify: `docker-compose.yml`
- Modify: `.env.example`

#### Step 1: 在 docker-compose.yml 新增 aktools 服务

在 `services:` 块中 frontend 之后、volumes 之前插入：

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

#### Step 2: 拉取并验证

```bash
docker compose pull aktools
docker compose up -d aktools
docker compose ps aktools
# 验证 AKTools HTTP API 可达
docker run --rm --network 01-neurocashengine_nce-network alpine wget -qO- http://nce-aktools:8080/api/public/stock_zh_a_spot_em | head -c 500
```

预期输出：AKTools 返回 JSON 数组，包含 A 股实时行情数据。

#### Step 3: 验证完成后关闭临时 aktools（后续随主 stack 一起启动）

```bash
docker compose down aktools  # 后续由 docker compose up -d 统一管理
```

---

### Task 2: MarketDataService + Providers

**Files:**
- Create: `backend/core/cash-flow-engine/src/services/providers/provider.interface.ts`
- Create: `backend/core/cash-flow-engine/src/services/providers/aktools.provider.ts`
- Create: `backend/core/cash-flow-engine/src/services/providers/direct-http.provider.ts`
- Create: `backend/core/cash-flow-engine/src/services/MarketDataService.ts`
- Create: `backend/core/cash-flow-engine/src/services/MarketDataService.spec.ts`
- Modify: `backend/core/cash-flow-engine/src/app.module.ts`

#### Step 1: 创建 provider.interface.ts

```typescript
export interface StockQuote {
  code: string;
  name: string;
  price: number;
  changePercent: number;
  changeAmount: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  volume: number;
  turnover: number;
  timestamp: Date;
}

export interface FundNAV {
  code: string;
  name: string;
  nav: number;
  accNav: number;
  navDate: string;
  dayChangePercent: number;
}

export interface IndexQuote {
  code: string;
  name: string;
  price: number;
  changePercent: number;
}

export interface KLineData {
  date: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  amount: number;
}

export interface MarketDataProvider {
  getStockQuotes(codes: string[]): Promise<StockQuote[]>;
  getFundNAVs(codes: string[]): Promise<FundNAV[]>;
  getKLine(code: string, period: string, days: number): Promise<KLineData[]>;
}

export class MarketDataError extends Error {
  constructor(message: string, public readonly source: string) {
    super(`[${source}] ${message}`);
  }
}
```

#### Step 2: 创建 aktools.provider.ts

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { MarketDataProvider, StockQuote, FundNAV, KLineData } from './provider.interface';

const AKTOOLS_URL = process.env.AKTOOLS_URL || 'http://nce-aktools:8080';

@Injectable()
export class AktoolsProvider implements MarketDataProvider {
  private readonly logger = new Logger(AktoolsProvider.name);
  private readonly timeout = 10000;

  constructor(private readonly http: HttpService) {}

  async getStockQuotes(codes: string[]): Promise<StockQuote[]> {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${AKTOOLS_URL}/api/public/stock_zh_a_spot_em`, { timeout: this.timeout })
      );
      const allStocks: any[] = Array.isArray(data) ? data : (data?.data || []);
      const codeSet = new Set(codes);
      return allStocks
        .filter((s: any) => codeSet.has(String(s['代码'])))
        .map((s: any) => ({
          code: String(s['代码']),
          name: String(s['名称'] || ''),
          price: Number(s['最新价'] || 0),
          changePercent: Number(s['涨跌幅'] || 0),
          changeAmount: Number(s['涨跌额'] || 0),
          high: Number(s['最高'] || 0),
          low: Number(s['最低'] || 0),
          open: Number(s['今开'] || 0),
          prevClose: Number(s['昨收'] || 0),
          volume: Number(s['成交量'] || 0),
          turnover: Number(s['成交额'] || 0),
          timestamp: new Date(),
        }));
    } catch (err) {
      throw new MarketDataError((err as Error).message, 'AKTools');
    }
  }

  async getFundNAVs(codes: string[]): Promise<FundNAV[]> {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${AKTOOLS_URL}/api/public/fund_open_fund_daily_em`, { timeout: this.timeout })
      );
      const allFunds: any[] = Array.isArray(data) ? data : (data?.data || []);
      const codeSet = new Set(codes);
      return allFunds
        .filter((f: any) => codeSet.has(String(f['基金代码'])))
        .map((f: any) => ({
          code: String(f['基金代码']),
          name: String(f['基金简称'] || ''),
          nav: Number(f['单位净值'] || 0),
          accNav: Number(f['累计净值'] || 0),
          navDate: String(f['净值日期'] || ''),
          dayChangePercent: Number(f['日增长率'] || 0),
        }));
    } catch (err) {
      throw new MarketDataError((err as Error).message, 'AKTools');
    }
  }

  async getKLine(code: string, period: string = 'daily', days: number = 90): Promise<KLineData[]> {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${AKTOOLS_URL}/api/public/stock_zh_a_hist`, {
          params: { symbol: code, period },
          timeout: this.timeout,
        })
      );
      const rows: any[] = Array.isArray(data) ? data : (data?.data || []);
      return rows.slice(-days).map((r: any) => ({
        date: String(r['日期'] || ''),
        open: Number(r['开盘'] || 0),
        close: Number(r['收盘'] || 0),
        high: Number(r['最高'] || 0),
        low: Number(r['最低'] || 0),
        volume: Number(r['成交量'] || 0),
        amount: Number(r['成交额'] || 0),
      }));
    } catch (err) {
      throw new MarketDataError((err as Error).message, 'AKTools');
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await firstValueFrom(this.http.get(`${AKTOOLS_URL}/api/public/stock_zh_a_spot_em`, { timeout: 5000 }));
      return true;
    } catch {
      return false;
    }
  }
}
```

#### Step 3: 创建 direct-http.provider.ts

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { MarketDataProvider, StockQuote, FundNAV, KLineData } from './provider.interface';

@Injectable()
export class DirectHttpProvider implements MarketDataProvider {
  private readonly logger = new Logger(DirectHttpProvider.name);
  private readonly timeout = 8000;

  constructor(private readonly http: HttpService) {}

  async getStockQuotes(codes: string[]): Promise<StockQuote[]> {
    const results: StockQuote[] = [];
    for (const code of codes) {
      try {
        const prefix = code.startsWith('6') ? 'sh' : 'sz';
        const url = `https://hq.sinajs.cn/list=${prefix}${code}`;
        const { data } = await firstValueFrom(
          this.http.get(url, {
            headers: { Referer: 'https://finance.sina.com.cn' },
            timeout: this.timeout,
            responseType: 'text',
          })
        );
        const match = data.match(/"(.+)"/);
        if (match) {
          const parts = match[1].split(',');
          results.push({
            code,
            name: parts[0] || '',
            price: parseFloat(parts[3]) || 0,
            changePercent: parseFloat(parts[4]) || 0,
            changeAmount: parseFloat(parts[3] - parts[2]) || 0,
            high: parseFloat(parts[4]) || 0,
            low: parseFloat(parts[5]) || 0,
            open: parseFloat(parts[1]) || 0,
            prevClose: parseFloat(parts[2]) || 0,
            volume: parseFloat(parts[8]) || 0,
            turnover: parseFloat(parts[9]) || 0,
            timestamp: new Date(),
          });
        }
      } catch (err) {
        this.logger.warn(`Fallback getStockQuotes failed for ${code}: ${(err as Error).message}`);
      }
    }
    return results;
  }

  async getFundNAVs(codes: string[]): Promise<FundNAV[]> {
    this.logger.warn('Fallback getFundNAVs not implemented');
    return [];
  }

  async getKLine(code: string, period: string = 'daily', days: number = 90): Promise<KLineData[]> {
    this.logger.warn('Fallback getKLine not implemented');
    return [];
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.getStockQuotes(['000001']);
      return true;
    } catch {
      return false;
    }
  }
}
```

#### Step 4: 创建 MarketDataService.ts

```typescript
import { Injectable, Logger, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AktoolsProvider } from './providers/aktools.provider';
import { DirectHttpProvider } from './providers/direct-http.provider';
import { MarketDataProvider, StockQuote, FundNAV, KLineData } from './providers/provider.interface';

@Injectable()
export class MarketDataService {
  private readonly logger = new Logger(MarketDataService.name);
  private readonly primary: AktoolsProvider;
  private readonly fallback: DirectHttpProvider;
  private primaryHealthy = true;

  constructor(private readonly http: HttpService) {
    this.primary = new AktoolsProvider(http);
    this.fallback = new DirectHttpProvider(http);
  }

  private getProvider(): MarketDataProvider {
    return this.primaryHealthy ? this.primary : this.fallback;
  }

  async switchProvider(): Promise<void> {
    const healthy = await this.primary.healthCheck();
    if (healthy !== this.primaryHealthy) {
      this.primaryHealthy = healthy;
      this.logger.log(`AKTools provider ${healthy ? 'restored' : 'unavailable, switching to fallback'}`);
    }
  }

  async getStockQuotes(codes: string[]): Promise<StockQuote[]> {
    try {
      return await this.getProvider().getStockQuotes(codes);
    } catch (err) {
      this.logger.warn(`Primary failed, trying fallback: ${(err as Error).message}`);
      this.primaryHealthy = false;
      const fallbackResult = await this.fallback.getStockQuotes(codes);
      if (fallbackResult.length === 0) throw err;
      return fallbackResult;
    }
  }

  async getFundNAVs(codes: string[]): Promise<FundNAV[]> {
    try {
      return await this.getProvider().getFundNAVs(codes);
    } catch (err) {
      this.logger.warn(`Primary failed for fund NAVs: ${(err as Error).message}`);
      this.primaryHealthy = false;
      return this.fallback.getFundNAVs(codes);
    }
  }

  async getKLine(code: string, period: string = 'daily', days: number = 90): Promise<KLineData[]> {
    try {
      return await this.getProvider().getKLine(code, period, days);
    } catch (err) {
      this.logger.warn(`Primary failed for KLine: ${(err as Error).message}`);
      this.primaryHealthy = false;
      return this.fallback.getKLine(code, period, days);
    }
  }
}
```

#### Step 5: 创建 MarketDataService.spec.ts

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { MarketDataService } from './MarketDataService';
import { AxiosResponse } from 'axios';

describe('MarketDataService', () => {
  let service: MarketDataService;
  let http: HttpService;

  const mockResponse = (data: any): Partial<AxiosResponse> => ({ data, status: 200, statusText: 'OK', headers: {}, config: {} as any });

  beforeEach(async () => {
    http = { get: jest.fn() } as any;
    service = new MarketDataService(http);
    jest.spyOn(service as any, 'switchProvider').mockResolvedValue(undefined);
  });

  describe('getStockQuotes', () => {
    it('should return stock quotes from primary provider', async () => {
      (http.get as jest.Mock).mockReturnValue(of(mockResponse([
        { '代码': '000001', '名称': '平安银行', '最新价': 12.34, '涨跌幅': 1.23, '涨跌额': 0.15, '最高': 12.50, '最低': 12.10, '今开': 12.20, '昨收': 12.19, '成交量': 100000, '成交额': 1230000 }
      ])));
      const result = await service.getStockQuotes(['000001']);
      expect(result).toHaveLength(1);
      expect(result[0].code).toBe('000001');
      expect(result[0].price).toBe(12.34);
    });

    it('should fallback to DirectHttpProvider on primary failure', async () => {
      (http.get as jest.Mock)
        .mockReturnValueOnce(throwError(() => new Error('AKTools unreachable')))
        .mockReturnValue(of({ data: 'var hq_str_sz000001="平安银行,12.20,12.19,12.34,12.50,12.10,100000,1230000,1.23";', status: 200, statusText: 'OK', headers: {}, config: {} as any }));
      const result = await service.getStockQuotes(['000001']);
      expect(result).toHaveLength(1);
      expect(result[0].code).toBe('000001');
    });
  });

  describe('getFundNAVs', () => {
    it('should return fund NAVs from primary', async () => {
      (http.get as jest.Mock).mockReturnValue(of(mockResponse([
        { '基金代码': '110011', '基金简称': '易方达中小盘', '单位净值': 5.1234, '累计净值': 6.2345, '净值日期': '2026-05-14', '日增长率': 0.56 }
      ])));
      const result = await service.getFundNAVs(['110011']);
      expect(result).toHaveLength(1);
      expect(result[0].code).toBe('110011');
      expect(result[0].nav).toBe(5.1234);
    });
  });

  describe('getKLine', () => {
    it('should return KLine data', async () => {
      (http.get as jest.Mock).mockReturnValue(of(mockResponse([
        { '日期': '2026-05-14', '开盘': 12.20, '收盘': 12.34, '最高': 12.50, '最低': 12.10, '成交量': 100000, '成交额': 1230000 }
      ])));
      const result = await service.getKLine('000001', 'daily', 1);
      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2026-05-14');
      expect(result[0].close).toBe(12.34);
    });
  });
});
```

#### Step 6: 修改 app.module.ts

在 `imports` 中添加 `HttpModule`，在 `providers` 中添加 `MarketDataService`：

```typescript
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    // ... existing imports
    HttpModule,
  ],
  controllers: [
    // ... existing controllers
  ],
  providers: [
    // ... existing providers
    MarketDataService,
  ],
})
```

#### Step 7: 运行测试

```bash
cd backend/core/cash-flow-engine
npm test -- --testPathPattern="MarketDataService"
```

预期输出：所有 MarketDataService 测试通过。

---

### Task 3: MarketDataController + API 路由

**Files:**
- Create: `backend/core/cash-flow-engine/src/controllers/MarketDataController.ts`
- Create: `backend/core/cash-flow-engine/src/controllers/MarketDataController.spec.ts`
- Modify: `backend/core/cash-flow-engine/src/app.module.ts` (已在上一步完成)

#### Step 1: 创建 MarketDataController.ts

```typescript
import { Controller, Get, Query, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MarketDataService } from '../services/MarketDataService';

@Controller('market')
@UseGuards(JwtAuthGuard)
export class MarketDataController {
  private readonly logger = new Logger(MarketDataController.name);

  constructor(private readonly marketData: MarketDataService) {}

  @Get('stocks')
  async getStockQuotes(@Query('codes') codes: string) {
    const codeList = codes.split(',').map(c => c.trim()).filter(Boolean);
    if (codeList.length === 0) return { data: [] };
    const quotes = await this.marketData.getStockQuotes(codeList);
    return { data: quotes };
  }

  @Get('funds')
  async getFundNAVs(@Query('codes') codes: string) {
    const codeList = codes.split(',').map(c => c.trim()).filter(Boolean);
    if (codeList.length === 0) return { data: [] };
    return { data: await this.marketData.getFundNAVs(codeList) };
  }

  @Get('kline')
  async getKLine(
    @Query('code') code: string,
    @Query('period') period: string = 'daily',
    @Query('days') days: string = '90',
  ) {
    if (!code) return { data: [] };
    return { data: await this.marketData.getKLine(code, period, parseInt(days, 10)) };
  }

  @Get('health')
  async healthCheck() {
    return { status: 'ok' };
  }
}
```

#### Step 2: 创建 MarketDataController.spec.ts

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MarketDataController } from './MarketDataController';
import { MarketDataService } from '../services/MarketDataService';

describe('MarketDataController', () => {
  let controller: MarketDataController;
  let service: MarketDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarketDataController],
      providers: [
        {
          provide: MarketDataService,
          useValue: {
            getStockQuotes: jest.fn().mockResolvedValue([{ code: '000001', name: '平安银行', price: 12.34 }]),
            getFundNAVs: jest.fn().mockResolvedValue([{ code: '110011', nav: 5.1234 }]),
            getKLine: jest.fn().mockResolvedValue([{ date: '2026-05-14', close: 12.34 }]),
          },
        },
      ],
    }).compile();

    controller = module.get<MarketDataController>(MarketDataController);
    service = module.get<MarketDataService>(MarketDataService);
  });

  it('should return stock quotes', async () => {
    const result = await controller.getStockQuotes('000001');
    expect(result.data).toHaveLength(1);
    expect(result.data[0].code).toBe('000001');
  });

  it('should return empty for no codes', async () => {
    const result = await controller.getStockQuotes('');
    expect(result.data).toEqual([]);
  });

  it('should return fund NAVs', async () => {
    const result = await controller.getFundNAVs('110011');
    expect(result.data[0].nav).toBe(5.1234);
  });

  it('should return KLine data', async () => {
    const result = await controller.getKLine('000001', 'daily', '1');
    expect(result.data[0].close).toBe(12.34);
  });
});
```

#### Step 3: 注册 Controller

确保 `app.module.ts` 的 `controllers` 数组中包含 `MarketDataController`。

#### Step 4: 运行测试

```bash
cd backend/core/cash-flow-engine
npm test -- --testPathPattern="MarketData"
```

预期输出：所有 market 测试通过。

---

### Task 4: 前端 API 客户端

**Files:**
- Create: `frontend/shared/src/api/market-data.ts`
- Modify: `frontend/shared/src/index.ts`

#### Step 1: 创建 market-data.ts

```typescript
import { apiClient } from './client';

export interface StockQuote {
  code: string;
  name: string;
  price: number;
  changePercent: number;
}

export interface FundNAV {
  code: string;
  name: string;
  nav: number;
  navDate: string;
}

export interface KLinePoint {
  date: string;
  close: number;
  high: number;
  low: number;
}

export const getStockQuotes = async (codes: string[]): Promise<StockQuote[]> => {
  if (codes.length === 0) return [];
  const res = await apiClient.get('/market/stocks', { params: { codes: codes.join(',') } });
  return res.data?.data || [];
};

export const getFundNAVs = async (codes: string[]): Promise<FundNAV[]> => {
  if (codes.length === 0) return [];
  const res = await apiClient.get('/market/funds', { params: { codes: codes.join(',') } });
  return res.data?.data || [];
};

export const getKLine = async (code: string, period = 'daily', days = 90): Promise<KLinePoint[]> => {
  const res = await apiClient.get('/market/kline', { params: { code, period, days } });
  return res.data?.data || [];
};
```

#### Step 2: 修改 index.ts

在 `frontend/shared/src/index.ts` 中导出 market-api：

```typescript
export * from './api/market-data';
```

---

## 验收标准

| 任务 | 验收标准 |
|------|---------|
| T1 AKTools | `docker compose ps` 显示 nce-aktools 运行中；内部 HTTP 调用返回行情数据 |
| T2 MarketDataService | 测试通过；primary→fallback 切换逻辑正常 |
| T3 MarketDataController | `GET /market/stocks?codes=000001` 返回 JSON |
| T4 前端 API | `getStockQuotes(['000001'])` 返回正确格式 |
