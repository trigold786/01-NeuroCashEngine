# NeuroCashEngine 快速启动指南

## 🚀 5分钟快速启动

### 前提条件
请确保您已安装以下软件：
- Node.js 18.0+ (https://nodejs.org/)
- Docker Desktop (https://www.docker.com/products/docker-desktop)

### 步骤1：初始化项目
```bash
# 进入项目目录
cd 01-NeuroCashEngine

# 检查.env文件（已创建）
cat .env
```

### 步骤2：构建并启动所有服务
由于我们有多个微服务，推荐分步启动确保稳定性：

#### 首先启动基础设施（PostgreSQL、Redis）
```bash
cd 01-NeuroCashEngine
docker-compose up -d postgres redis

# 等待约30秒，让PostgreSQL和Redis完全启动
# 可以查看日志确认
docker-compose logs -f postgres
```

#### 然后启动后端服务
```bash
# 启动account-center（核心认证服务）
docker-compose up -d account-center

# 启动其他核心服务
docker-compose up -d cash-flow-engine content-hub data-product-api

# 启动共享服务
docker-compose up -d notification-service config-service file-storage-service
```

### 步骤3：验证后端服务是否正常
```bash
# 测试健康检查端点
# 账户中心
curl http://localhost:3001/health

# 内容中心
curl http://localhost:3006/health

# 数据产品API
curl http://localhost:3007/api/health
```

### 步骤4：启动前端PWA
```bash
# 先安装前端依赖
cd frontend/apps/pwa
npm install

# 启动开发服务器
npm run dev
```

### 步骤5：访问应用
打开浏览器访问：
- 前端PWA应用：http://localhost:5173
- 健康检查页面：各服务端口根路径

---

## 📖 功能测试指南

### C端用户测试流程
1. 访问 http://localhost:5173
2. 点击"立即注册"创建个人账号
3. 登录后进入Dashboard
4. 点击"资产概览"测试添加资产账户
5. 点击"资讯中心"查看资讯列表
6. 点击资讯查看详情

### B端用户测试流程
1. 注册账号时选择"企业用户"
2. 登录后Dashboard会显示B端功能入口
3. 点击"现金流预测"查看预警和预测图表
4. 点击"SOP管理"生成资金调拨SOP

---

## 🐛 常见问题

### 问题：端口被占用
**解决方案：**
修改 `docker-compose.yml` 中的端口映射。

### 问题：PostgreSQL连接失败
**解决方案：**
- 确认PostgreSQL容器是否正常运行：`docker-compose ps`
- 检查.env中的DB_PASSWORD配置
- 等待PostgreSQL完全启动（通常需要30-60秒）

### 问题：前端无法连接后端API
**解决方案：**
- 确认后端服务是否正常启动
- 检查VITE_*_API_URL环境变量
- 检查浏览器控制台的网络请求

---

## 📊 各服务说明
| 服务 | 端口 | 功能 |
|------|------|------|
| account-center | 3001 | 用户注册、登录、JWT认证 |
| cash-flow-engine | 3005 | C/B端核心业务 |
| content-hub | 3006 | 资讯聚合服务 |
| data-product-api | 3007 | 数据产品API |
| notification-service | 3002 | 消息推送（预留） |
| config-service | 3003 | 配置管理（预留） |
| file-storage-service | 3004 | 文件存储（预留） |
| 前端PWA | 5173 | 用户界面 |

---

## 🎯 下一步建议
1. 查看完整README文档
2. 根据需要修改配置参数
3. 测试完整业务流程
4. 部署到生产环境

祝您使用愉快！如有问题请查看文档或联系开发团队。
