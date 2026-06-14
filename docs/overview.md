# 项目概述

## 1. 项目简介

本项目是一个现代化的个人博客系统，采用前后端分离架构，包含三个核心模块：

| 模块 | 技术栈 | 职责 |
|------|--------|------|
| **blog-server** | Go + Gin + GORM + SQLite | RESTful API 后端服务 |
| **blog-web** | Next.js 14 + TypeScript + Tailwind CSS | 前端展示层 |
| **Hugo** | Hugo + Congo Theme | 静态博客生成器 |

## 2. 项目结构

```
blog/
├── blog-server/          # Go 后端服务
│   ├── main.go           # 项目入口
│   ├── config/           # 配置管理
│   ├── router/           # 路由注册
│   ├── handler/          # HTTP 处理器
│   ├── service/          # 业务逻辑层
│   ├── repository/       # 数据访问层
│   ├── model/            # 数据模型
│   └── middleware/       # 中间件
├── blog-web/             # Next.js 前端
│   ├── app/              # App Router 页面
│   ├── components/       # React 组件
│   ├── hooks/            # 自定义 Hooks
│   └── lib/              # API 封装
├── blog-hugo/            # Hugo 静态博客（与根目录内容一致）
│   ├── content/          # Markdown 内容
│   ├── layouts/          # 模板布局
│   ├── static/           # 静态资源
│   └── assets/           # 编译资源
├── congo/                # Congo 主题源码
└── docs/                 # 技术文档
```

## 3. 核心功能

### 3.1 前台功能
- 文章列表展示（SSG 预渲染）
- 文章详情页（含评论区）
- 评论提交与展示
- 响应式设计

### 3.2 管理后台功能
- 管理员登录（JWT 认证）
- 文章 CRUD 管理
- 评论管理（查看/删除）
- 标签管理

## 4. 技术亮点

1. **混合渲染策略**：前台使用 SSG + ISR 实现高性能，后台使用 CSR 实现动态交互
2. **纯静态导出**：前端可部署到任何静态文件服务器
3. **JWT 认证**：安全的管理端身份验证
4. **分层架构**：清晰的 Handler → Service → Repository 架构
5. **环境变量配置**：符合 12-Factor App 原则