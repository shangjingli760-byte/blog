# Hugo 静态博客架构

## 1. 目录结构

```
blog/ (Hugo 根目录)
├── hugo.toml              # Hugo 配置
├── archetypes/
│   └── default.md         # 文章原型模板
├── content/               # Markdown 内容
│   ├── posts/             # 文章目录
│   │   └── *.md
│   ├── about.md           # 关于页面
│   └── admin/             # 管理后台页面
│       ├── _index.md      # 概览仪表盘
│       ├── articles.md    # 文章管理
│       ├── comments.md    # 评论管理
│       └── login.md       # 登录页
├── layouts/               # 模板布局
│   ├── _partials/         # 可复用组件
│   │   ├── comments.html  # 评论区组件
│   │   └── extend-footer.html # 动画脚本
│   ├── admin/             # 管理后台布局
│   │   ├── baseof.html    # 管理后台基础框架
│   │   └── admin.html     # 管理后台路由分发
│   └── partials/admin/    # 管理后台面板
│       ├── dashboard.html
│       ├── articles.html
│       ├── comments.html
│       └── login.html
├── static/                # 静态资源
│   ├── css/admin.css      # 管理后台样式
│   ├── images/            # 图片资源
│   └── js/                # JavaScript 文件
│       ├── comments.js    # 前台评论脚本
│       └── admin/         # 管理后台脚本
│           ├── admin-api.js
│           ├── admin-auth.js
│           ├── articles.js
│           └── comments.js
└── assets/                # 编译资源
    └── css/custom.css     # 自定义样式
```

## 2. Hugo 配置

### 2.1 基础配置（hugo.toml）

```toml
baseURL = "https://yourdomain.com/"
languageCode = "zh-cn"
title = "My Blog"
theme = "congo"

[permalinks]
posts = "/articles/:slugorcontentbasename/"

[taxonomies]
tag = "tags"
category = "categories"

[markup.goldmark.renderer]
unsafe = true  # 允许 HTML 直出
```

### 2.2 菜单配置

| 名称 | 路径 | 权重 |
|------|------|------|
| 文章 | /posts | 10 |
| 标签 | /tags | 20 |
| 关于 | /about | 30 |
| 外观切换 | - | 40 |

### 2.3 Congo 主题参数

| 参数 | 值 | 说明 |
|------|-----|------|
| colorScheme | congo | 配色方案 |
| homeLayout | page | 主页布局模式 |
| showBreadcrumbs | true | 显示面包屑 |
| showToc | true | 显示目录 |
| showComments | true | 启用评论 |

## 3. 内容结构

### 3.1 文章 Front Matter

```yaml
---
title: "文章标题"
date: 2024-01-01
tags: ["技术", "博客"]
categories: ["生活"]
showComments: true
---
```

### 3.2 管理后台页面

所有管理后台页面共用以下 Front Matter：

```yaml
---
title: "页面标题"
type: admin
layout: admin
adminType: dashboard  # 或 articles/comments/login
_build:
  list: never
  render: true
---
```

## 4. 模板布局

### 4.1 管理后台基础框架（layouts/admin/baseof.html）

```
┌─────────────────────────────────────────────┐
│  顶部导航栏（站点名称、前台链接、退出按钮）   │
├──────────────┬──────────────────────────────┤
│   左侧边栏   │         主内容区              │
│  (w-56)      │         {children}           │
│              │                              │
│  - 概览      │                              │
│  - 文章管理  │                              │
│  - 评论管理  │                              │
└──────────────┴──────────────────────────────┘
```

### 4.2 路由分发（layouts/admin/admin.html）

根据 `adminType` 参数分发到不同面板：

| adminType | 渲染 partial |
|-----------|--------------|
| login | admin/login |
| articles | admin/articles |
| comments | admin/comments |
| 默认 | admin/dashboard |

## 5. 静态资源

### 5.1 JavaScript 文件

| 文件 | 功能 |
|------|------|
| static/js/comments.js | 前台评论系统（加载、提交） |
| static/js/admin/admin-api.js | API 封装（token管理、认证请求） |
| static/js/admin/admin-auth.js | 登录态检查 |
| static/js/admin/articles.js | 文章管理 CRUD |
| static/js/admin/comments.js | 评论管理（列表、删除） |

### 5.2 AdminAPI 封装

```javascript
const adminApi = {
  getToken: () => localStorage.getItem('admin_token'),
  setToken: (token) => localStorage.setItem('admin_token', token),
  clearToken: () => localStorage.removeItem('admin_token'),
  
  authGet: (path) => fetch(..., { headers: { Authorization: `Bearer ${token}` } }),
  authPost: (path, data) => fetch(..., { method: 'POST', body: JSON.stringify(data), ... }),
  // ...
};
```

## 6. 自定义样式（assets/css/custom.css）

### 6.1 视觉效果

| 效果 | CSS 实现 |
|------|----------|
| 全屏背景图 | html::after + fixed + background-image |
| 浮动光斑 | 3个模糊圆形 + 无限动画 |
| 滚动揭示 | Intersection Observer + opacity + transform |
| 3D 卡片悬浮 | hover + transform + box-shadow |
| 链接下划线动画 | ::after + transition |
| 毛玻璃效果 | backdrop-filter: blur |

### 6.2 动画模块

1. **页面加载淡入**：body 入场动画
2. **滚动揭示**：元素进入视口时触发
3. **打字机效果**：副标题逐字显示
4. **视差滚动**：背景光斑随滚动移动
5. **平滑页面过渡**：内部链接点击淡出

## 7. 管理后台架构

### 7.1 认证流程

```
页面加载 → admin-auth.js 检查 token
  ├─ 无 token → 跳转 /admin/login
  └─ 有 token → 继续渲染页面

登录成功 → admin-api.js setToken() → 跳转 /admin

退出 → admin-api.js clearToken() → 跳转 /admin/login
```

### 7.2 数据流

```
浏览器 → static/js/admin/*.js → AdminAPI.fetch() → blog-server → SQLite
```

### 7.3 API 调用示例

```javascript
// 获取文章列表
adminApi.authGet('/api/admin/articles')
  .then(res => res.json())
  .then(data => { /* 渲染列表 */ });

// 创建文章
adminApi.authPost('/api/admin/articles', {
  title: '新文章',
  slug: 'new-article',
  content: '# Hello',
  tags: ['技术']
});
```

## 8. 与 blog-web 的关系

### 8.1 相同点

- 共享同一个后端 API（blog-server）
- 管理后台逻辑相同

### 8.2 不同点

| 特性 | Hugo | blog-web |
|------|------|----------|
| 渲染方式 | 静态 HTML | Next.js SSG |
| 前台路由 | /posts/* | /articles/* |
| 技术栈 | Hugo + Congo | Next.js + React |
| 部署方式 | 纯静态文件 | 静态导出 |

### 8.3 选择建议

- **Hugo**：追求极致性能、快速构建、主题生态
- **blog-web**：需要更多交互、React 生态、更灵活的定制