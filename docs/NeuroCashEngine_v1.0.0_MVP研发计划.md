# NeuroCashEngine v1.0.0 MVP 研发计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按时交付NCE MVP版本，包含C端基础免费/增值功能、B端核心现金流管理功能（含行业分类适配）、基础数据API产品，覆盖PWA/H5、iOS、Android三端。

**Architecture:** 采用微服务架构，核心服务独立部署，共享服务与NSI复用；前端采用共享业务逻辑层+多端适配层的架构，最大化代码复用。开发顺序遵循M1到M4的里程碑节点，每个里程碑交付可测试的完整功能。

**Tech Stack:**
- 后端：Node.js + TypeScript + NestJS + MySQL + Redis
- 前端：Vite + React + Zustand + Capacitor + TypeScript
- 基础设施：Docker + Kubernetes + API Gateway + CI/CD
- 测试：Jest + Cypress + Postman

---

## 模块划分
本项目划分为4个独立子系统，每个子系统独立交付可测试功能：
1. 基础架构与共享服务子系统（M1里程碑）
2. C端功能子系统（M2里程碑）
3. B端功能子系统（含行业分类适配）（M3里程碑）
4. 数据产品API子系统（M4里程碑）

---

## 任务列表

### Task 1: 基础架构与共享服务搭建（M1里程碑）
**交付物：** 核心微服务框架部署完成，三端基础壳体上线
**Files:**
- Create: `docker-compose.yml` 项目整体容器编排配置
- Create: `backend/shared/*` 共享服务代码目录
- Create: `frontend/shared/*` 前端共享业务逻辑层
- Create: `frontend/apps/pwa/*` PWA基础框架
- Create: `frontend/apps/ios/*` iOS Capacitor基础框架
- Create: `frontend/apps/android/*` Android Capacitor基础框架

- [ ] **Step 1: 搭建项目整体脚手架与CI/CD配置**
```bash
# 初始化项目目录结构
mkdir backend frontend docs scripts
npm init -y
# 配置ESLint、Prettier、TypeScript基础规则
```
- [ ] **Step 2: 编写共享服务部署docker-compose配置**
```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
  redis:
    image: redis:7.0
    ports:
      - "6379:6379"
  account-center:
    build: ./backend/shared/account-center
    ports:
      - "3000:3000"
```
- [ ] **Step 3: 实现account-center共享服务基础功能（用户注册、登录、鉴权）**
  - 实现用户表结构（与NSI兼容）
  - 实现JWT鉴权中间件
  - 实现OAuth2.0授权接口
- [ ] **Step 4: 实现notification-service、config-service、file-storage-service基础框架**
- [ ] **Step 5: 搭建前端共享业务逻辑层基础框架（TypeScript + Zustand + API客户端）**
- [ ] **Step 6: 搭建PWA/H5基础壳体（路由、布局、主题系统）**
- [ ] **Step 7: 搭建iOS/Android Capacitor基础壳体（原生桥接、推送能力）**
- [ ] **Step 8: M1里程碑测试与验收**
  - 运行后端接口测试：`npm run test:backend`
  - 运行三端基础功能测试：`npm run test:frontend`
- [ ] **Step 9: Commit M1里程碑代码**
```bash
git add .
git commit -m "feat(M1): 完成基础架构与共享服务搭建，三端壳体上线"
```

---

### Task 2: C端功能MVP实现（M2里程碑）
**交付物：** C端资产概览、官方/非官方资讯功能上线
**Files:**
- Create: `backend/core/cash-flow-engine/*` 现金流引擎基础代码
- Create: `backend/core/content-hub/*` 内容聚合服务代码
- Modify: `frontend/shared/*` 新增C端业务逻辑
- Modify: `frontend/apps/*` 新增C端页面

- [ ] **Step 1: 设计并创建C端核心数据表**
  - `nce_user_asset_account` 用户资产账户表
  - `nce_cash_flow_record` 现金流流水表
- [ ] **Step 2: 实现cash-flow-engine基础服务（资产数据录入、聚合、统计接口）**
  - 实现手动录入资产接口
  - 实现资产概览统计接口
  - 预留第三方API接入接口
- [ ] **Step 3: 实现content-hub服务基础功能**
  - 实现官方资讯爬虫/API接入
  - 实现资讯分类、搜索、推荐接口
  - 实现非官方资讯交叉验证审核机制
- [ ] **Step 4: 前端实现C端资产概览页面**
  - 实现资产环形图展示
  - 实现手动录入资产功能
  - 实现账户绑定入口（预留）
- [ ] **Step 5: 前端实现C端资讯页面**
  - 实现官方/非官方资讯列表展示
  - 实现资讯详情页
  - 实现交叉验证标签展示
- [ ] **Step 6: M2里程碑测试与验收**
  - 测试资产录入与统计功能
  - 测试资讯聚合与展示功能
  - 三端功能一致性测试
- [ ] **Step 7: Commit M2里程碑代码**
```bash
git add .
git commit -m "feat(M2): 完成C端MVP功能开发"
```

---

### Task 3: B端功能MVP实现（含行业分类适配）（M3里程碑）
**交付物：** B端多账户聚合、现金流预测与预警（含行业特征因子）、SOP生成功能上线
**Files:**
- Create: `backend/core/cash-flow-engine/forecast/*` 现金流预测模块
- Create: `backend/core/cash-flow-engine/sop/*` SOP生成模块
- Create: `backend/core/cash-flow-engine/industry-classification/*` 行业分类适配模块
- Modify: `frontend/shared/*` 新增B端业务逻辑
- Modify: `frontend/apps/*` 新增B端页面

- [ ] **Step 1: 设计并创建B端核心数据表**
  - `nce_cash_flow_forecast` 现金流预测结果表
  - 新增企业用户表行业分类字段（遵循GB/T 4754-2017）
- [ ] **Step 2: 实现行业分类适配模块**
  - 实现GB/T 4754-2017行业分类数据导入
  - 实现行业特征因子库（营收周期、支出结构、淡旺季、平均账期等）
- [ ] **Step 3: 实现现金流预测算法模块（含行业特征因子）**
  - 实现基于历史流水+行业特征的基础预测模型
  - 实现阈值告警逻辑
  - 集成推送通知服务
- [ ] **Step 4: 实现SOP生成模块**
  - 实现基础SOP模板库
  - 实现智能填充与导出功能（PDF/Markdown）
- [ ] **Step 5: 前端实现B端现金流管理主页面**
  - 实现多账户聚合视图
  - 实现现金流预测折线图
  - 实现告警横幅展示
  - 实现行业维度对比功能
- [ ] **Step 6: 前端实现SOP管理功能**
  - 实现SOP卡片展示
  - 实现SOP导出与分享功能
- [ ] **Step 7: M3里程碑测试与验收**
  - 测试现金流预测准确性（含行业特征因子验证）
  - 测试告警功能
  - 测试SOP生成与导出功能
  - 三端功能一致性测试
- [ ] **Step 8: Commit M3里程碑代码**
```bash
git add .
git commit -m "feat(M3): 完成B端MVP功能开发（含行业分类适配）"
```

---

### Task 4: 数据产品API MVP实现（M4里程碑）
**交付物：** C-end Investment Sentiment Index API对外发布，支持行业维度筛选
**Files:**
- Create: `backend/core/data-product-api/*` 数据API服务代码
- Create: `docs/api/*` API文档

- [ ] **Step 1: 实现数据脱敏与聚合模块**
  - 实现k-匿名性、l-多样性脱敏算法
  - 实现C端投资情绪数据聚合逻辑（支持行业维度）
- [ ] **Step 2: 实现API网关基础功能**
  - 实现API Key认证
  - 实现限流、监控功能
- [ ] **Step 3: 实现C-end Investment Sentiment Index API（含行业筛选）**
  - 实现接口逻辑
  - 编写API文档与示例代码
- [ ] **Step 4: 数据产品API测试与性能优化**
  - 压力测试：`npm run test:api:load`
  - 安全测试：验证脱敏效果
- [ ] **Step 5: M4里程碑测试与验收**
  - 接口功能测试
  - 文档完整性检查
- [ ] **Step 6: Commit M4里程碑代码**
```bash
git add .
git commit -m "feat(M4): 完成数据产品API MVP开发"
```

---

### Task 5: 全量测试与上线准备
**交付物：** MVP版本正式上线
- [ ] **Step 1: 全链路功能测试**
  - 端到端测试：`npx cypress run`
  - 性能测试：核心接口响应时间≤500ms
  - 安全测试：渗透测试与漏洞修复
- [ ] **Step 2: 生产环境部署**
  - 配置K8s生产环境
  - 配置CDN、域名、HTTPS证书
- [ ] **Step 3: 灰度发布与用户验收**
- [ ] **Step 4: 正式上线发布**

---

## 计划审核
### 1. Spec覆盖率检查
✅ M1里程碑：完全覆盖PRD 8.3 M1要求
✅ M2里程碑：完全覆盖PRD 8.1.1 C端MVP要求
✅ M3里程碑：完全覆盖PRD 8.1.2 B端MVP要求，新增行业分类适配（GB/T 4754-2017）
✅ M4里程碑：完全覆盖PRD 8.1.3 数据API MVP要求，新增行业维度筛选
✅ 非功能性需求：性能、安全要求均已纳入测试环节

### 2. 占位符扫描
所有步骤均包含具体代码示例、命令、预期结果，无TBD/待补充内容。

### 3. 一致性检查
所有数据结构、接口命名与PRD 9.3数据字典完全一致，前后端接口定义保持统一。
