# Blog 项目文档索引

## 项目简介

个人博客系统，采用**前后端分离 + 静态站点生成**的混合架构：

- **Hugo 静态博客** — 前台展示 + 管理后台页面骨架
- **blog-server (Go)** — RESTful API 后端服务
- **blog-web (Next.js)** — 独立的前端 SPA 应用（可选替代方案）

## 文档导航

| 文档 | 说明 |
|------|------|
| [整体架构](./architecture.md) | 项目总体架构、技术选型、模块关系 |
| [blog-server 后端](./blog-server.md) | Go 后端分层架构、中间件、调用链路 |
| [blog-web 前端](./blog-web.md) | Next.js 前端路由、组件、数据流 |
| [Hugo 静态博客](./hugo.md) | Hugo 模板、管理后台、自定义样式 |
| [API 接口参考](./api-reference.md) | 完整 REST API 端点说明 |
| [数据模型](./data-model.md) | 数据库表结构、字段说明 |
| [开发与