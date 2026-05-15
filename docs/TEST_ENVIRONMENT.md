# NeuroCashEngine 测试环境说明

## 访问地址

| 入口 | URL | 说明 |
|------|-----|------|
| **Web PWA** | `https://localhost/` | 前端应用（SPA） |
| **Traefik Dashboard** | `https://traefik.localhost/` | 路由管理面板（需配置 hosts） |
| **HTTPS** | `https://localhost/...` | 自签名证书，浏览器需信任 |

## 测试账号

### C端（个人投资者）

| 项目 | 值 |
|------|-----|
| 邮箱 | `test@neurocash.com` |
| 密码 | `Test123456` |
| 用户名 | `test_user` |
| 账户类型 | 个人 (individual) |
| 预置资产 | 现金¥50,000 / 存款¥200,000 / 基金¥100,000 / 股票¥150,000 |

### B端（企业用户）

| 项目 | 值 |
|------|-----|
| 邮箱 | `biz@neurocash.com` |
| 密码 | `Biz123456` |
| 用户名 | `biz_user` |
| 公司名称 | 测试科技有限公司 |
| 行业分类 | I6420 (互联网信息服务) |

## 已验证的核心API端点

| 端点 | 认证 | 说明 |
|------|------|------|
| `POST /api/auth/login` | 否 | 登录，返回 JWT |
| `POST /api/auth/register` | 否 | 注册 |
| `GET /assets/overview` | JWT | 资产概览 |
| `GET /assets/accounts` | JWT | 资产账户列表 |
| `POST /assets/accounts` | JWT | 创建资产账户 |
| `GET /market/stocks?codes=000001,600519` | JWT | **实时股价**（东财直连） |
| `GET /market/funds?codes=110011` | JWT | **实时基金净值** |
| `GET /market/kline?code=000001&period=daily&days=90` | JWT | **K线数据** |
| `GET /market/health` | JWT | 行情服务健康检查 |
| `GET /cashflow/forecast?days=90` | JWT | 现金流预测 |
| `GET /business/cashflow` | JWT | B端现金流 |
| `GET /news` | 否 | 资讯列表 |
| `GET /news/categories` | 否 | 资讯分类 |
| `GET /strategy/recommendation` | JWT | C端投资策略 |
| `GET /enterprise/strategy` | JWT | B端投资策略 |
| `GET /config` | JWT | 系统配置 |
| `GET /` | 否 | SPA首页 |
| `GET /data-product/docs` | 否 | 数据产品API文档 |
| `GET /dp/sentiment/investment` | API Key | 投资情绪指数 |

## 容器状态

```
9 containers: traefik, postgres, redis, account-center, cash-flow-engine,
              content-hub, data-product-api, frontend, aktools
```

## 测试建议

1. **打开浏览器** → `https://localhost/` → 用 `test@neurocash.com` / `Test123456` 登录
2. **查看资产概览** — 已有4类资产账户预置
3. **查看实时行情** — 页面通过 `/market/stocks` 获取实时股价
4. **测试现金流** — 切换到 B端账户登录查看现金流预测
5. **查看资讯** — 无需登录即可浏览
