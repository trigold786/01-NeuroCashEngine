# NeuroCashEngine - 现金增值引擎

## 项目简介

NeuroCashEngine（NCE）是一款赋能个人投资者（C端）和小微企业主（B端）的智能现金增值与管理平台。本项目基于NeuroCashEngine BRD v0.2.0构建。

## 功能特性

### C端功能
- 现金、存款、基金、股票四大基本产品投资比例概览
- 央媒等官方渠道时事、财经资讯聚合
- 非官方但已多渠道交叉验证的资讯服务
- 可视化资产配置展示

### B端功能
- 多账户聚合与实时视图
- 现金流智能预测与预警
- 资金调拨SOP自动生成
- 行业分类适配功能

### 数据产品API
- C端投资情绪指数API
- 数据脱敏与合规处理

## 技术架构

### 后端（微服务）
- 技术栈：Node.js + TypeScript + NestJS + MySQL + Redis
- 服务架构：
  - `account-center`：用户账户管理、认证授权（端口3001）
  - `notification-service`：消息推送、告警通知（端口3002）
  - `config-service`：系统配置管理（端口3003）
  - `file-storage-service`：文件存储服务（端口3004）
  - `cash-flow-engine`：现金流引擎、C/B端业务核心（端口3005）
  - `content-hub`：内容聚合服务（端口3006）
  - `data-product-api`：数据产品API服务（端口3007）

### 前端
- 技术栈：React + TypeScript + Vite + Zustand + Chart.js
- 支持端：PWA/H5（已实现），iOS/Android（Capacitor预留）

## 快速开始

### 前置要求
- Node.js 18+
- Docker & Docker Compose

### 本地启动
1. 克隆项目：
   ```bash
   git clone <repo-url>
   cd 01-NeuroCashEngine
   ```

2. 配置环境变量：
   ```bash
   cp .env.example .env
   # 编辑 .env 配置您的参数
   ```

3. 启动所有服务：
   ```bash
   docker-compose up -d
   ```

4. 访问前端应用：
   - PWA应用：http://localhost:5173
   - 后端API文档见各服务根路径

### 开发模式
后端服务可以单独启动开发模式：
```bash
cd backend/<service-name>
npm run start:dev
```

前端PWA单独启动：
```bash
cd frontend/apps/pwa
npm run dev
```

## 项目结构
```
01-NeuroCashEngine/
├── backend/
│   ├── shared/           # 共享服务
│   │   ├── account-center
│   │   ├── notification-service
│   │   ├── config-service
│   └── file-storage-service
│   └── core/            # 核心业务服务
│       ├── cash-flow-engine
│       ├── content-hub
│       └── data-product-api
├── frontend/
│   ├── shared/          # 共享业务逻辑
│   │   ├── src/
│   │   │   ├── types/   # 类型定义
│   │   │   ├── api/    # API客户端
│   │   │   └── store/  # 状态管理
│   └── apps/
│       └── pwa/         # PWA应用
├── docs/               # 文档目录
├── docker-compose.yml
└── README.md
```

## 里程碑完成情况
- ✅ M1：基础架构与共享服务搭建
- ✅ M2：C端功能MVP实现
- ✅ M3：B端功能MVP实现
- ✅ M4：数据产品API MVP实现

## 贡献指南
请遵循项目的代码规范和开发流程。

## 许可证
ISC
