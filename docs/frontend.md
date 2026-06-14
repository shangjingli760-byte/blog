# 前端应用架构

## 1. 目录结构

```
blog-web/
├── app/                    # App Router 页面
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首页（文章列表）
│   ├── articles/
│   │   └── [slug]/
│   │       └── page.tsx    # 文章详情页
│   └── admin/
│       ├── layout.tsx      # 管理后台布局
│       ├── page.tsx        # 管理后台首页
│       ├── login/
│       │   └── page.tsx    # 登录页
│       ├── articles/
│       │   └── page.tsx    # 文章管理页
│       └── comments/
│           └── page.tsx    # 评论管理页
├── components/             # React 组件
│   ├── Header.tsx          # 顶部导航
│   ├── ArticleCard.tsx     # 文章卡片
│   └── CommentSection.tsx  # 评论区组件
├── hooks/                  # 自定义 Hooks
│   ├── useArticles.ts      # 文章数据 Hook
│   └── useComments.ts      # 评论数据 Hook
├── lib/                    # 工具函数和 API 封装
│   ├── api.ts              # 公开 API
│   └── adminApi.ts         # 管理 API
├── next.config.js          # Next.js 配置
├── tailwind.config.js      # Tailwind 配置
└── tsconfig.json           # TypeScript 配置
```

## 2. 技术栈

| 类别 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 框架 | Next.js | 14.2.0 | App Router，SSG 导出 |
| 语言 | TypeScript | 5.4.0 | 类型安全 |
| 样式 | Tailwind CSS | 3.4.3 | 原子化 CSS |
| 构建 | PostCSS | 8.4.38 | CSS 编译 |

## 3. 路由结构

### 3.1 前台路由（SSG）

| 路径 | 页面 | 渲染方式 | 说明 |
|------|------|----------|------|
| / | app/page.tsx | Server Component | 文章列表首页 |
| /articles/[slug] | app/articles/[slug]/page.tsx | Server Component | 文章详情页 |

### 3.2 后台路由（CSR）

| 路径 | 页面 | 渲染方式 | 说明 |
|------|------|----------|------|
| /admin/login | app/admin/login/page.tsx | Client Component | 登录页 |
| /admin | app/admin/page.tsx | Client Component | 管理后台首页 |
| /admin/articles | app/admin/articles/page.tsx | Client Component | 文章管理 |
| /admin/comments | app/admin/comments/page.tsx | Client Component | 评论管理 |

## 4. 布局架构

### 4.1 前台布局链

```
RootLayout (app/layout.tsx)
├── <html lang="zh-CN">
├── <body className="bg-gray-50">
│   ├── <Header />        # 顶部导航
│   ├── <main className="max-w-4xl mx-auto">
│   │   └── {children}    # 页面内容
│   └── <footer>          # 页脚
```

### 4.2 后台布局链

```
AdminLayout (app/admin/layout.tsx)
├── useEffect: 检查 token，未登录跳转到 /admin/login
├── 登录页: 全屏登录表单，无边栏
├── 其他页:
│   ├── <aside className="w-56 bg-gray-900">
│   │   ├── 导航链接（概览/文章/评论）
│   │   └── 退出按钮
│   └── <main className="flex-1 p-6">
│       └── {children}
```

## 5. API 层设计

### 5.1 公开 API（lib/api.ts）

| 函数 | 方法 | 端点 | 说明 |
|------|------|------|------|
| getArticles() | GET | /api/articles | 获取文章列表（ISR缓存1小时） |
| getArticleBySlug(slug) | GET | /api/articles/{slug} | 获取文章详情 |
| getComments(slug) | GET | /api/articles/{slug}/comments | 获取评论列表 |
| postComment(slug, data) | POST | /api/articles/{slug}/comments | 提交评论 |

### 5.2 管理 API（lib/adminApi.ts）

| 函数 | 方法 | 端点 | 说明 |
|------|------|------|------|
| adminLogin(username, password) | POST | /api/admin/login | 管理员登录 |
| createArticle(data) | POST | /api/admin/articles | 创建文章 |
| updateArticle(slug, data) | PUT | /api/admin/articles/{slug} | 更新文章 |
| deleteArticle(slug) | DELETE | /api/admin/articles/{slug} | 删除文章 |
| getAdminComments() | GET | /api/admin/comments | 获取所有评论 |
| deleteComment(id) | DELETE | /api/admin/comments/{id} | 删除评论 |
| getAdminTags() | GET | /api/admin/tags | 获取标签列表 |

### 5.3 响应格式

```json
{
  "code": 0,
  "msg": "success",
  "data": {}
}
```

## 6. 数据获取模式

### 6.1 SSG（服务端预渲染）

```
构建阶段:
  app/page.tsx → getArticles() → fetch API → 返回数据 → 生成静态 HTML
  app/articles/[slug]/page.tsx → generateStaticParams() → 获取所有slug → 为每个slug生成页面
```

### 6.2 ISR（增量静态再生成）

```
getArticles() 和 getArticleBySlug() 使用:
fetch(url, { next: { revalidate: 3600 } })
→ 构建时缓存数据
→ 每小时重新验证一次
```

### 6.3 CSR（客户端渲染）

```
浏览器加载 → 'use client' 组件挂载 → useEffect → fetch API → setState → 渲染
```

## 7. 状态管理

### 7.1 组件本地状态

使用 React useState 管理各组件内部状态：

| 组件 | 状态 |
|------|------|
| login/page.tsx | username, password, error, loading |
| admin/page.tsx | articleCount, commentCount |
| admin/articles/page.tsx | articles, tags, loading, editing, showEditor |
| admin/comments/page.tsx | comments, loading, message |
| CommentSection.tsx | nickname, email, content, submitting |

### 7.2 自定义 Hooks

| Hook | 功能 |
|------|------|
| useArticles() | 封装文章列表获取逻辑 |
| useComments(slug) | 封装评论获取和提交逻辑 |

### 7.3 全局状态

- **admin_token**: 存储在 localStorage
- 登录成功时写入，退出时清除
- 所有管理 API 请求自动携带此 token

## 8. 认证机制

```
登录流程:
  1. 用户输入用户名密码
  2. 调用 adminLogin() → POST /api/admin/login
  3. 服务器验证 → 返回 JWT token
  4. localStorage.setItem('admin_token', token)
  5. 跳转到 /admin

请求认证:
  1. 每次请求管理 API
  2. authHeaders() 读取 token
  3. 设置 Authorization: Bearer {token}
  4. 服务端验证 token

登录态检查:
  AdminLayout useEffect → 检查 token
  无 token → 跳转 /admin/login
```

## 9. 配置说明

### 9.1 next.config.js

```js
module.exports = {
  output: 'export',           // 静态导出模式
  images: { unoptimized: true }, // 禁用图片优化（静态导出不支持）
}
```

### 9.2 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| NEXT_PUBLIC_API_URL | http://localhost:8080 | 后端 API 地址 |