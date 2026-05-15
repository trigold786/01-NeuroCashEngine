# Phase 2: 基础设施加固设计文档

**版本：** v1.0  
**日期：** 2026-05-15  
**基于 PRD：** v1.0.0 | **BRD：** v0.2.0

---

## 1. 概述

NCE 第一阶段 MVP 已完成全部核心功能开发和全平台 UAT 验收。Phase 2 聚焦从开发环境到生产就绪的基础设施加固，涵盖 Traefik 边缘路由 + HTTPS、GitHub Actions CI/CD、k6 性能压测、OWASP ZAP 安全渗透，顺序推进。

## 2. 总体架构

### 当前架构（Phase 1）

```
用户 ──► Frontend Nginx (:3000) ──► 静态文件 (SPA)
                                    ├─► account-center (:3001)
                                    ├─► cash-flow-engine (:3005)
                                    ├─► content-hub (:3006)
                                    └─► data-product-api (:3007)
```

### 目标架构（Phase 2）

```
用户 ──► Traefik (:443 HTTPS / :80 HTTP重定向) ──► Frontend Nginx (:80 仅静态文件)
          Let's Encrypt 自动证书                       ├─► account-center (:3001)
                                                       ├─► cash-flow-engine (:3005)
                                                       ├─► content-hub (:3006)
                                                       └─► data-product-api (:3007)
```

### 核心变化

| 项目 | Phase 1 | Phase 2 |
|------|---------|---------|
| 边缘路由 | Frontend Nginx (proxy + 静态文件) | Traefik (TLS + 路由) |
| 静态文件 | 同一 Nginx 容器 | Frontend Nginx (仅静态文件, 无 proxy) |
| 路由配置 | nginx.conf 17个 location 块 | Traefik Docker labels |
| TLS | 无 (HTTP) | Let's Encrypt 自动 (开发用自签名) |
| CI/CD | 无 | GitHub Actions (lint → test → build) |
| 性能测试 | 无 | k6 脚本 |
| 安全测试 | 无 | OWASP ZAP DAST |

## 3. 子任务 1: Traefik 边缘路由 + HTTPS

### 3.1 Traefik 配置

- **部署方式**：docker-compose.yml 新增 `traefik` 服务
- **镜像**：`traefik:v3.3`
- **端口**：`80` (HTTP→HTTPS 重定向), `443` (HTTPS)
- **网络**：加入 `nce-network`
- **TLS**：开发环境使用自签名证书 (`TRAEFIK_INSECURE=true`)；生产环境通过 Let's Encrypt 自动获取
- **配置方式**：Docker Compose labels 声明式路由（保持配置与服务同行）

### 3.2 路由规则 (Traefik Docker labels)

所有现有 17 个 Nginx location 块迁移为 Traefik 路由规则，分为两类：

**A. 静态文件路由 (Frontend Nginx)：**

```
- "traefik.http.routers.frontend.rule=Host(`localhost`) && PathPrefix(`/`)"
- "traefik.http.services.frontend.loadbalancer.server.port=80"
```

**B. API 路由 (直接指向后端服务)：**

| 路由规则 | 目标服务:端口 |
|---------|-------------|
| `PathPrefix(/api/)` | account-center:3001 |
| `Path(/assets/overview)` | cash-flow-engine:3005 |
| `Path(/assets/accounts)` | cash-flow-engine:3005 |
| `PathPrefix(/cashflow/)` | cash-flow-engine:3005 |
| `PathPrefix(/business/)` | cash-flow-engine:3005 |
| `PathPrefix(/strategy/)` | cash-flow-engine:3005 |
| `PathPrefix(/enterprise/)` | cash-flow-engine:3005 |
| `PathPrefix(/nsi/)` | cash-flow-engine:3005 |
| `PathPrefix(/subscription/)` | cash-flow-engine:3005 |
| `Path(/notifications)` | cash-flow-engine:3005 |
| `PathPrefix(/points/)` | cash-flow-engine:3005 |
| `Path(/config)` | cash-flow-engine:3005 |
| `Path(/products)` | cash-flow-engine:3005 |
| `Path(/news)` | content-hub:3006 |
| `PathPrefix(/dp/)` | data-product-api:3007 (路径剥离) |
| `PathPrefix(/data-product/)` | data-product-api:3007 |

### 3.3 Frontend Nginx 简化

`nginx.conf` 移除所有 16 个 proxy location 块，仅保留：

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### 3.4 Docker Compose 变化

- 新增 `traefik` 服务
- 所有后端服务添加 Traefik labels
- `frontend` 服务移除 `ports: 3000:80` (不再直接暴露)
- 后端服务移除 `ports:` 映射 (通过 Traefik 内部路由)
- 仅 Traefik 暴露 `80` 和 `443` 端口

## 4. 子任务 2: GitHub Actions CI/CD

### 4.1 Workflow 设计

| Workflow | 触发条件 | 内容 |
|----------|---------|------|
| **CI - PR Check** | push/PR → master | lint + typecheck + test (cash-flow-engine + data-product-api + frontend) |
| **CD - Build** | push → master (CI通过后) | Docker Compose build all services |
| **Release** | tag v*.*.* | Docker build + push + release note |

### 4.2 CI Workflow 详情

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_USER: nce_root, POSTGRES_PASSWORD: nce_root_123, POSTGRES_DB: nce_db }
        options: --health-cmd pg_isready
      redis:
        image: redis:7-alpine
        options: --health-cmd redis-cli ping
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4 with node-version: 20
      - run: npm ci --legacy-peer-deps
      # 并行执行
      - run: cd backend/core/cash-flow-engine && npm test
      - run: cd backend/core/data-product-api && npm test
      - run: cd frontend/apps/pwa && npm test
```

## 5. 子任务 3: k6 性能压测

### 5.1 测试范围

| 场景 | 目标 API | 并发数 | 通过标准 |
|------|---------|--------|---------|
| 登录 | POST /api/auth/login | 50, 100 | p95 < 1s |
| 资产概览 | GET /assets/overview | 50, 100 | p95 < 1s |
| 现金流预测 | GET /cashflow/forecast | 50, 100 | p95 < 2s |
| 资讯列表 | GET /news | 50, 100 | p95 < 1s |

### 5.2 工具

- k6 Docker 镜像 (`grafana/k6`)
- 脚本存放位置：`tests/performance/k6-script.js`
- 结果输出：`tests/performance/report.json`

## 6. 子任务 4: OWASP ZAP 安全渗透

### 6.1 扫描范围

- **DAST 基线扫描**：自动爬取所有可达页面和 API 端点
- **检测项**：SQL 注入、XSS、CSRF、敏感信息泄露、CORS 配置、缺少安全 Header

### 6.2 工具

- OWASP ZAP Docker 镜像 (`softwaresecurityproject/zap-stable`)
- 扫描模式：被动扫描 (不修改数据)

## 7. 变更文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `docker-compose.yml` | 修改 | 新增 traefik 服务；后端服务添加 labels；移除后端直接端口暴露 |
| `frontend/apps/pwa/nginx.conf` | 修改 | 移除所有 proxy location，仅保留静态文件服务 |
| `frontend/apps/pwa/Dockerfile` | 不变 | 保持现有构建流程 |
| `.github/workflows/ci.yml` | 新增 | CI 流水线 |
| `.github/workflows/build.yml` | 新增 | Docker 构建 |
| `tests/performance/k6-script.js` | 新增 | 性能测试脚本 |
| `tests/performance/report.json` | 新增 | 性能报告 (自动生成) |
| `.env.example` | 修改 | 新增 TRAEFIK_INSECURE, ACME_EMAIL 等变量 |

## 8. 不纳入范围

- 数据库读写分离/主从复制
- Kubernetes/Docker Swarm 编排
- 多区域/多云部署
- 日志聚合系统 (ELK/Loki)
- APM 监控 (Prometheus/Grafana)
