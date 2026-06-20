# Blog 后端 API 文档

**Base URL:** `http://localhost:8080`

---

## 一、公开接口（无需认证）

### 1. 健康检查

```
GET /api/health
```

**响应:**
```json
{ "code": 0, "msg": "success", "data": { "status": "running", "database": "connected" } }
```

---

### 2. 获取文章列表

```
GET /api/articles
```

**响应:**
```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "title": "欢迎来到我的博客",
      "slug": "hello-world",
      "summary": "",
      "tags": "技术, 博客, 生活",
      "created_at": "2026-06-13T15:30:11+08:00",
      "updated_at": "2026-06-13T15:30:11+08:00"
    }
  ]
}
```

---

### 3. 获取文章详情

```
GET /api/articles/:slug
```

**示例:** `GET /api/articles/hello-world`

**响应:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "id": 1,
    "title": "欢迎来到我的博客",
    "slug": "hello-world",
    "content": "## Hello World\n\n这是我的第一篇博客文章...",
    "html": "<h2>Hello World</h2>\n<p>这是我的第一篇博客文章。</p>...",
    "summary": "",
    "tags": "技术, 博客, 生活",
    "created_at": "2026-06-13T15:30:11+08:00",
    "updated_at": "2026-06-13T15:30:11+08:00"
  }
}
```

---

### 4. 获取文章评论

```
GET /api/articles/:slug/comments
```

**响应:**
```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "article_id": 1,
      "nickname": "读者小明",
      "content": "写得很棒！",
      "created_at": "2026-06-20T16:00:00+08:00"
    }
  ]
}
```

---

### 5. 提交评论

```
POST /api/articles/:slug/comments
Content-Type: application/json
```

**请求体:**
```json
{
  "nickname": "读者小明",
  "email": "reader@example.com",
  "content": "写得很棒！"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| nickname | string | 是 | 昵称 |
| email | string | 是 | 邮箱（格式需合法） |
| content | string | 是 | 评论内容 |

**响应:**
```json
{
  "code": 0,
  "msg": "success",
  "data": { "id": 2, "article_id": 1, "nickname": "读者小明", "content": "写得很棒！", "created_at": "..." }
}
```

---

## 二、管理端接口（需要 JWT 认证）

> 所有管理接口需要在请求头携带 `Authorization: Bearer <token>`

---

### 6. 管理员登录

```
POST /api/admin/login
Content-Type: application/json
```

**请求体:**
```json
{ "username": "admin", "password": "admin123" }
```

**响应:**
```json
{
  "code": 0,
  "msg": "success",
  "data": { "token": "eyJhbGciOiJIUzI1NiIs..." }
}
```

> token 有效期 24 小时，前端存到 `localStorage` 键名 `admin_token`

---

### 7. 创建文章

```
POST /api/admin/articles
Content-Type: application/json
Authorization: Bearer <token>
```

**请求体:**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 文章标题 |
| slug | string | 是 | URL 标识（英文，如 `hello-world`） |
| content | string | 是 | Markdown 正文 |
| summary | string | 否 | 文章摘要 |
| tags | string | 否 | 标签，逗号分隔，如 `"技术, Go, 后端"` |

**请求示例:**
```json
{
  "title": "Go 并发编程入门",
  "slug": "go-concurrency-intro",
  "content": "## 什么是 Goroutine\n\nGoroutine 是 Go 语言中的轻量级线程...",
  "summary": "介绍 Go 语言并发编程的基础知识",
  "tags": "Go, 并发, 后端"
}
```

**成功响应:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "id": 2,
    "title": "Go 并发编程入门",
    "slug": "go-concurrency-intro",
    "content": "## 什么是 Goroutine\n\n...",
    "html": "<h2>什么是 Goroutine</h2>\n<p>...</p>",
    "summary": "介绍 Go 语言并发编程的基础知识",
    "tags": "Go, 并发, 后端"
  }
}
```

**说明:**
- `content` 字段存 Markdown 原文
- `html` 字段自动由 goldmark 渲染生成
- slug 重复会返回 400 错误

---

### 8. 更新文章

```
PUT /api/admin/articles/:slug
Content-Type: application/json
Authorization: Bearer <token>
```

**请求体格式与创建相同:**
```json
{
  "title": "Go 并发编程入门（修订版）",
  "slug": "go-concurrency-intro",
  "content": "## 什么是 Goroutine\n\n更新后的内容...",
  "summary": "修订后的摘要",
  "tags": "Go, 并发, 后端, 修订"
}
```

**成功响应:** 同创建，返回更新后的完整文章对象。

---

### 9. 删除文章

```
DELETE /api/admin/articles/:slug
Authorization: Bearer <token>
```

**示例:** `DELETE /api/admin/articles/go-concurrency-intro`

**成功响应:**
```json
{ "code": 0, "msg": "success" }
```

> 删除文章会同时删除其下所有评论（事务保证）

---

### 10. 评论列表（管理端）

```
GET /api/admin/comments?page=1&page_size=20
Authorization: Bearer <token>
```

**参数:**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| page | int | 1 | 页码 |
| page_size | int | 20 | 每页数量（最大 100） |

**响应:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      { "id": 1, "article_id": 1, "nickname": "读者小明", "email": "r@e.com", "content": "写得很棒！", "created_at": "..." }
    ],
    "total": 1,
    "page": 1,
    "page_size": 20
  }
}
```

---

### 11. 删除评论

```
DELETE /api/admin/comments/:id
Authorization: Bearer <token>
```

**成功响应:**
```json
{ "code": 0, "msg": "success" }
```

---

### 12. 获取所有标签

```
GET /api/admin/tags
Authorization: Bearer <token>
```

**响应:**
```json
{
  "code": 0,
  "msg": "success",
  "data": ["技术", "博客", "生活", "Go", "后端"]
}
```

> 从已有文章的 tags 字段提取去重，用于前端标签选择器

---

## 三、统一错误格式

所有接口错误返回格式：

```json
{ "code": 400, "msg": "错误描述" }
```

| code | 含义 |
|------|------|
| 0 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（未登录或 token 无效） |
| 404 | 资源不存在 |
| 500 | 服务端错误 |

---

## 四、完整调用示例

```bash
# 1. 登录
curl -X POST http://localhost:8080/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
# → {"code":0,"data":{"token":"eyJ..."}}

# 2. 用 token 创建文章
curl -X POST http://localhost:8080/api/admin/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJ..." \
  -d '{"title":"新文章","slug":"new-post","content":"# Hello\n\n这是正文","summary":"摘要","tags":"标签1, 标签2"}'

# 3. 公开接口获取
curl http://localhost:8080/api/articles/new-post
```
