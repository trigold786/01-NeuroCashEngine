# NeuroCashEngine API 文档

## 概述
本文档介绍NeuroCashEngine各服务的API接口。

---

## 1. Account Center API (端口3001)
负责用户注册、登录、认证授权。

### 1.1 注册用户
**POST** `/auth/register`

**请求体：**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "testuser",
  "accountType": "INDIVIDUAL",
  "companyName": "可选，企业用户必填",
  "industryName": "可选"
}
```

**响应：**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "testuser"
  },
  "accessToken": "jwt-token"
}
```

### 1.2 用户登录
**POST** `/auth/login`

**请求体：**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### 1.3 健康检查
**GET** `/health`
---

## 2. Cash Flow Engine API (端口3005)
核心业务服务，处理资产和现金流。

### 2.1 获取资产概览
**GET** `/assets/overview`

### 2.2 获取账户列表
**GET** `/assets/accounts`

### 2.3 创建资产账户
**POST** `/assets/accounts`

### 2.4 获取B端现金流预测
**POST** `/business/cashflow/forecast`

### 2.5 获取SOP列表
**GET** `/business/cashflow/sop`

---

## 3. Content Hub API (端口3006)
资讯聚合服务。

### 3.1 获取资讯列表
**GET** `/news`
**查询参数：**
- `category` (可选): 新闻分类
- `keyword` (可选): 搜索关键词

### 3.2 获取资讯详情
**GET** `/news/:id`

---

## 4. Data Product API (端口3007)
数据产品API，返回脱敏后的聚合数据。

### 4.1 获取投资情绪指数
**GET** `/api/investment-sentiment`
**查询参数：**
- `startDate` (可选): YYYY-MM-DD
- `endDate` (可选): YYYY-MM-DD
- `category` (可选): 资产类别

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "date": "2026-05-08",
      "assetCategory": "STOCK",
      "sentimentScore": 65.5,
      "totalSamples": 5234
    }
  ]
}
```

### 4.2 获取最新情绪概览
**GET** `/api/investment-sentiment/latest`

### 4.3 健康检查
**GET** `/api/health`

---

## 通用说明
### 认证方式
需要认证的API使用Bearer Token，在请求头中添加：
```
Authorization: Bearer <access-token>
```

### 响应格式
所有API统一使用JSON响应格式，结构如下：
```json
{
  "success": true,
  "data": {...}
}
```

错误响应：
```json
{
  "status": "error",
  "message": "错误信息"
}
```

---

## 数据安全说明
所有API均遵循以下数据安全原则：
1. 敏感信息加密存储（如密码使用bcrypt）
2. 数据产品API返回完全脱敏的聚合数据
3. 严格权限控制
