# Phase 2: 基础设施加固实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成 NCE 基础设施加固 — Traefik 边缘路由 + HTTPS、GitHub Actions CI/CD、k6 性能压测、OWASP ZAP 安全渗透

**Architecture:** Traefik v3.3 作为边缘路由替换 Frontend Nginx 的 proxy 职能，Frontend Nginx 仅保留静态文件服务。所有后端服务通过 Traefik Docker labels 声明路由规则，Traefik 自动处理 Let's Encrypt TLS。CI/CD 通过 GitHub Actions 实现 lint → test → build 自动化流水线。

**Tech Stack:** Traefik v3.3, GitHub Actions, k6, OWASP ZAP, Docker Compose

**执行顺序:** Task 1(Traefik) → Task 2(CI/CD) → Task 3(k6) → Task 4(ZAP)

---

## 文件结构

| 文件 | 操作 | 职责 |
|------|------|------|
| `docker-compose.yml` | 修改 | 新增 traefik 服务；所有服务添加 Traefik labels；移除直接端口暴露 |
| `frontend/apps/pwa/nginx.conf` | 修改 | 移除 16 个 proxy location，仅保留静态文件 SPA fallback |
| `.github/workflows/ci.yml` | 新增 | CI 流水线：lint + typecheck + test |
| `.github/workflows/build.yml` | 新增 | Docker 构建流水线 |
| `.env.example` | 修改 | 新增 Traefik 环境变量 |
| `tests/performance/k6-script.js` | 新增 | k6 压测脚本 |
| `tests/performance/report.json` | 新增 | 压测报告(自动生成) |

---

### Task 1: Traefik 边缘路由 + HTTPS

**Files:**
- Modify: `docker-compose.yml`
- Modify: `frontend/apps/pwa/nginx.conf`
- Modify: `.env.example`

#### Step 1: 修改 docker-compose.yml — 新增 traefik 服务

在 `services:` 块开头新增 traefik 服务：

```yaml
  traefik:
    image: traefik:v3.3
    container_name: nce-traefik
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    command:
      - "--api.dashboard=true"
      - "--api.debug=false"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--entrypoints.web.http.redirections.entrypoint.to=websecure"
      - "--entrypoints.web.http.redirections.entrypoint.scheme=https"
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.email=${ACME_EMAIL:-admin@neurocashengine.com}"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.caserver=https://acme-v02.api.letsencrypt.org/directory"
    volumes:
      - traefik-letsencrypt:/letsencrypt
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.dashboard.rule=Host(`traefik.localhost`)"
      - "traefik.http.routers.dashboard.service=api@internal"
      - "traefik.http.routers.dashboard.middlewares=auth"
      - "traefik.http.middlewares.auth.basicauth.users=${TRAEFIK_USER:-admin}:${TRAEFIK_PASS_HASH:-$$2y$$10$$xxxxxxxxxxx}"
    restart: unless-stopped
    networks:
      - nce-network
```

在 `volumes:` 块新增卷：

```yaml
  traefik-letsencrypt:
```

#### Step 2: 为 account-center 添加 Traefik labels

在 account-center 的 `services:` 块中添加：

```yaml
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.account-center.rule=PathPrefix(`/api/`)"
      - "traefik.http.routers.account-center.entrypoints=websecure"
      - "traefik.http.services.account-center.loadbalancer.server.port=3001"
```

同时在该服务配置中移除 `ports:` 映射（或改为注释），新增 `expose: ["3001"]`：

```yaml
    expose:
      - "3001"
```

完整 account-center 服务（修改后）：

```yaml
  account-center:
    build: ./backend/shared/account-center
    container_name: nce-account-center
    expose:
      - "3001"
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USER=${DB_USER:-nce_root}
      - DB_PASSWORD=${DB_PASSWORD:-nce_root_123}
      - DB_NAME=nce_db
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - JWT_SECRET=${JWT_SECRET:-nce_jwt_secret_key_123}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: on-failure
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.account-center.rule=PathPrefix(`/api/`)"
      - "traefik.http.routers.account-center.entrypoints=websecure"
      - "traefik.http.services.account-center.loadbalancer.server.port=3001"
    networks:
      - nce-network
```

#### Step 3: 为 cash-flow-engine 添加 Traefik labels

```yaml
  cash-flow-engine:
    build: ./backend/core/cash-flow-engine
    container_name: nce-cash-flow-engine
    expose:
      - "3005"
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USER=${DB_USER:-nce_root}
      - DB_PASSWORD=${DB_PASSWORD:-nce_root_123}
      - DB_NAME=nce_db
      - JWT_SECRET=${JWT_SECRET:-nce_jwt_secret_key_123}
    depends_on:
      postgres:
        condition: service_healthy
    restart: on-failure
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.cashflow-assets-overview.rule=Path(`/assets/overview`)"
      - "traefik.http.routers.cashflow-assets-overview.entrypoints=websecure"
      - "traefik.http.routers.cashflow-assets-accounts.rule=Path(`/assets/accounts`)"
      - "traefik.http.routers.cashflow-assets-accounts.entrypoints=websecure"
      - "traefik.http.routers.cashflow.rule=PathPrefix(`/cashflow/`) || PathPrefix(`/business/`) || PathPrefix(`/strategy/`) || PathPrefix(`/enterprise/`) || PathPrefix(`/nsi/`) || PathPrefix(`/subscription/`) || Path(`/notifications`) || PathPrefix(`/points/`) || Path(`/config`) || Path(`/products`)"
      - "traefik.http.routers.cashflow.entrypoints=websecure"
      - "traefik.http.services.cashflow.loadbalancer.server.port=3005"
    networks:
      - nce-network
```

注意：cash-flow-engine 路由规则使用 OR (`||`) 合并为一个 router，减少重复 label。

#### Step 4: 为 content-hub 添加 Traefik labels

```yaml
  content-hub:
    build: ./backend/core/content-hub
    container_name: nce-content-hub
    expose:
      - "3006"
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USER=${DB_USER:-nce_root}
      - DB_PASSWORD=${DB_PASSWORD:-nce_root_123}
      - DB_NAME=nce_db
    depends_on:
      postgres:
        condition: service_healthy
    restart: on-failure
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.content-hub.rule=Path(`/news`)"
      - "traefik.http.routers.content-hub.entrypoints=websecure"
      - "traefik.http.services.content-hub.loadbalancer.server.port=3006"
    networks:
      - nce-network
```

#### Step 5: 为 data-product-api 添加 Traefik labels

注意：`/dp/` 需要 StripPrefix middleware 剥离前缀：

```yaml
  data-product-api:
    build: ./backend/core/data-product-api
    container_name: nce-data-product-api
    expose:
      - "3007"
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USER=${DB_USER:-nce_root}
      - DB_PASSWORD=${DB_PASSWORD:-nce_root_123}
      - DB_NAME=nce_db
    depends_on:
      postgres:
        condition: service_healthy
    restart: on-failure
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.data-product-dp.rule=PathPrefix(`/dp/`)"
      - "traefik.http.routers.data-product-dp.entrypoints=websecure"
      - "traefik.http.routers.data-product-dp.middlewares=strip-dp-prefix"
      - "traefik.http.middlewares.strip-dp-prefix.stripprefix.prefixes=/dp"
      - "traefik.http.routers.data-product-api.rule=PathPrefix(`/data-product/`)"
      - "traefik.http.routers.data-product-api.entrypoints=websecure"
      - "traefik.http.services.data-product-api.loadbalancer.server.port=3007"
    networks:
      - nce-network
```

#### Step 6: 修改 frontend 服务

移除 `ports: 3000:80`，添加 Traefik labels 和 `expose`：

```yaml
  frontend:
    build:
      context: ./frontend
      dockerfile: apps/pwa/Dockerfile
    container_name: nce-frontend
    expose:
      - "80"
    depends_on:
      - account-center
      - cash-flow-engine
      - content-hub
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=HostRegexp(`{host:.+}`)"
      - "traefik.http.routers.frontend.entrypoints=websecure"
      - "traefik.http.routers.frontend.priority=1"
      - "traefik.http.services.frontend.loadbalancer.server.port=80"
    networks:
      - nce-network
```

注意：`priority=1` 确保 API 路由（默认 priority=0）优先匹配，前端路由作为 fallback。

#### Step 7: 简化 nginx.conf

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

#### Step 8: 更新 .env.example

新增：

```bash
# Traefik
TRAEFIK_INSECURE=true
TRAEFIK_USER=admin
TRAEFIK_PASS_HASH=
ACME_EMAIL=admin@neurocashengine.com
```

在文件末尾追加说明：

```bash
# Generate Traefik password hash:
#   docker run traefik:v3.3 htpasswd -nb admin your_password 2>/dev/null | cut -d: -f2
```

#### Step 9: 启动并验证

```bash
docker compose down
# 清理旧容器和网络
docker compose up -d
# 验证所有服务启动
docker compose ps
# 验证 Traefik dashboard
curl -k https://traefik.localhost/dashboard/
# 验证 API 通过 Traefik 可达
curl -k https://localhost/api/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"uat3@example.com","password":"UAT123456"}'
# 验证 SPA 静态文件可达
curl -k https://localhost/ | head -20
```

预期输出：所有服务状态 `Up`，Traefik dashboard 可达，API 返回正常 JSON，SPA 返回 HTML。

---

### Task 2: GitHub Actions CI/CD

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/build.yml`
- Modify: `package.json` (updated test scripts)

#### Step 1: 创建 CI workflow

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci --legacy-peer-deps
        working-directory: frontend
      - run: npm run lint
        working-directory: frontend
        continue-on-error: true

  typecheck:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service:
          - backend/shared/account-center
          - backend/core/cash-flow-engine
          - backend/core/content-hub
          - backend/core/data-product-api
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: ${{ matrix.service }}/package-lock.json
      - run: npm ci
        working-directory: ${{ matrix.service }}
      - run: npx tsc --noEmit
        working-directory: ${{ matrix.service }}

  test-backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: nce_root
          POSTGRES_PASSWORD: nce_root_123
          POSTGRES_DB: nce_db
        options: >-
          --health-cmd pg_isready
          --health-interval 5s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 5s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    strategy:
      matrix:
        service:
          - backend/core/cash-flow-engine
          - backend/core/data-product-api
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: ${{ matrix.service }}/package-lock.json
      - run: npm ci
        working-directory: ${{ matrix.service }}
      - run: npm test -- --maxWorkers=2
        working-directory: ${{ matrix.service }}
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_USER: nce_root
          DB_PASSWORD: nce_root_123
          DB_NAME: nce_db
          REDIS_HOST: localhost
          REDIS_PORT: 6379
          JWT_SECRET: nce_jwt_secret_key_123

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci --legacy-peer-deps
        working-directory: frontend
      - run: npm run build -w @nce/shared
        working-directory: frontend
      - run: npm test
        working-directory: frontend/apps/pwa
```

#### Step 2: 创建 Build workflow

`.github/workflows/build.yml`:

```yaml
name: Build

on:
  push:
    branches: [master]
  workflow_dispatch:

jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      - name: Build all services
        run: docker compose build --parallel
      - name: Verify images exist
        run: docker images --filter "reference=nce-*" --format "{{.Repository}}:{{.Tag}}"
```

#### Step 3: 推送到 GitHub 并验证

```bash
git add .github/
git commit -m "ci: add GitHub Actions CI/CD workflows"
git push origin master
```

验证：在 https://github.com/trigold786/01-NeuroCashEngine/actions 查看 workflow 运行状态。

---

### Task 3: k6 性能压测

**Files:**
- Create: `tests/performance/k6-script.js`
- Create: `tests/performance/run.sh`

#### Step 1: 创建 k6 压测脚本

`tests/performance/k6-script.js`:

```javascript
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const baseUrl = __ENV.BASE_URL || 'https://localhost';
const failureRate = new Rate('failed_requests');
const loginTrend = new Trend('login_duration');
const assetsTrend = new Trend('assets_duration');

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '30s', target: 50 },
    { duration: '30s', target: 100 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    failed_requests: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
  },
  insecureSkipTLSVerify: true,
};

export default function () {
  group('Login', () => {
    const payload = JSON.stringify({
      email: 'uat3@example.com',
      password: 'UAT123456',
    });
    const res = http.post(`${baseUrl}/api/auth/login`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    loginTrend.add(res.timings.duration);
    failureRate.add(res.status !== 201);
    check(res, {
      'login status 201': (r) => r.status === 201,
      'login has token': (r) => r.json('access_token') !== undefined,
    });
    if (res.status === 201) {
      const token = res.json('access_token');
      sleep(1);

      group('Asset Overview', () => {
        const res2 = http.get(`${baseUrl}/assets/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        assetsTrend.add(res2.timings.duration);
        failureRate.add(res2.status !== 200);
        check(res2, {
          'assets status 200': (r) => r.status === 200,
        });
      });
      sleep(1);

      group('News List', () => {
        const res3 = http.get(`${baseUrl}/news`);
        failureRate.add(res3.status !== 200);
        check(res3, { 'news status 200': (r) => r.status === 200 });
      });
      sleep(1);

      group('Cash Flow Forecast', () => {
        const res4 = http.get(`${baseUrl}/cashflow/forecast?days=90`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        failureRate.add(res4.status !== 200);
        check(res4, { 'forecast status 200': (r) => r.status === 200 });
      });
    }
  });
}
```

#### Step 2: 创建运行脚本

`tests/performance/run.sh`:

```bash
#!/bin/bash
set -e

echo "=== k6 Performance Test ==="
echo "Base URL: ${BASE_URL:-https://localhost}"

docker run --rm -i \
  -v "$(pwd)/tests/performance:/scripts" \
  grafana/k6 run \
  --out json=/scripts/report.json \
  /scripts/k6-script.js \
  -e BASE_URL="${BASE_URL:-https://localhost}"

echo "Report: tests/performance/report.json"
```

#### Step 3: 运行并验证

```bash
chmod +x tests/performance/run.sh
./tests/performance/run.sh
```

预期输出：k6 完成 4 阶段压力测试，`report.json` 包含详细性能指标，`failed_requests` 比率 < 5%。

---

### Task 4: OWASP ZAP 安全渗透

**Files:**
- Create: `tests/security/zap-scan.sh`
- Create: `tests/security/zap-report.json` (自动生成)

#### Step 1: 创建 ZAP 扫描脚本

`tests/security/zap-scan.sh`:

```bash
#!/bin/bash
set -e

TARGET_URL="${TARGET_URL:-https://localhost}"
REPORT_DIR="tests/security"

echo "=== OWASP ZAP Security Scan ==="
echo "Target: ${TARGET_URL}"

mkdir -p "${REPORT_DIR}"

docker run --rm \
  -v "$(pwd)/${REPORT_DIR}:/zap/wrk" \
  -u zap \
  softwaresecurityproject/zap-stable \
  zap-baseline.py \
  -t "${TARGET_URL}" \
  -g gen.conf \
  -r zap-report.html \
  -w zap-report.md \
  -x zap-report.xml \
  -I \
  -d

echo "Reports generated in ${REPORT_DIR}/"
echo "  - zap-report.html (detailed)"
echo "  - zap-report.md (summary)"
echo "  - zap-report.xml (machine-readable)"
```

#### Step 2: 运行扫描并验证

```bash
chmod +x tests/security/zap-scan.sh
./tests/security/zap-scan.sh
```

查看扫描结果：
```bash
cat tests/security/zap-report.md | head -100
```

预期输出：ZAP 基线扫描完成，生成 HTML/MD/XML 报告。检查是否有高危告警（SQL注入、XSS等），如有则记录并修复。

---

## 验收标准

| 任务 | 验收标准 |
|------|---------|
| T1 Traefik | 所有 7 个服务通过 Traefik 可达；HTTPS 连接正常；SPA 页面正常加载；API 路由正常响应 |
| T2 CI/CD | GitHub Actions CI 流水线全部通过 (lint + typecheck + test) |
| T3 k6 | 100 并发下 p95 < 2s，失败率 < 5% |
| T4 ZAP | 基线扫描无高危漏洞确认 |
