# API 接口参考

## 1. 基础信息

### 1.1 服务地址
- 开发环境: `http://localhost:8080`
- 生产环境: 配置环境变量 `PORT`

### 1.2 响应格式

所有接口返回统一格式：

```json
{
  "code": 0,
  "msg": "success",
  "data": {}
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | number | 0 表示成功，非 0 表示错误码 |
| msg | string | 提示信息 |
| data | any | 数据内容 |

### 1.3 认证方式

管理接口需要在请求头中携带 JWT Token：

```
Authorization: Bearer <token>
```

## 2. 公开接口（无需认证）

### 2.1 健康检查

**GET /api/health**

**请求示例:**
```bash
curl http://localhost:8080/api/health
```

**成功响应:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "status": "ok",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

### 2.2 获取文章列表

**GET /api/articles**

**请求示例:**
```bash
curl http://localhost:8080/api/articles
```

**成功响应:**
```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "title": "欢迎来到我的博客",
      "slug": "hello-world",
      "summary": "这是我的第一篇博客文章",
      "tags": ["技术", "博客"],
      "created_at": "2024-01-01T12:00:00Z",
      "updated_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### 2.3 获取文章详情

**GET /api/articles/:slug**

**路径参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| slug | string | 文章的 URL 标识 |

**请求示例:**
```bash
curl http://localhost:8080/api/articles/hello-world
```

**成功响应:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "id": 1,
    "title": "欢迎来到我的博客",
    "slug": "hello-world",
    "summary": "这是我的第一篇博客文章",
    "tags": ["技术", "博客"],
    "content": "# Hello World\n\n欢迎来到我的博客！",
    "html": "<h1>Hello World</h1><p>欢迎来到我的博客！</p>",
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  }
}
```

**失败响应 (文章不存在):**
```json
{
  "code": 404,
  "msg": "文章不存在",
  "data": null
}
```

### 2.4 获取文章评论列表

**GET /api/articles/:slug/comments**

**路径参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| slug | string | 文章的 URL 标识 |

**请求示例:**
```bash
curl http://localhost:8080/api/articles/hello-world/comments
```

**成功响应:**
```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "article_id": 1,
      "nickname": "访客",
      "email": "guest@example.com",
      "content": "写得真好！",
      "created_at": "2024-01-01T13:00:00Z"
    }
  ]
}
```

### 2.5 提交评论

**POST /api/articles/:slug/comments**

**路径参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| slug | string | 文章的 URL 标识 |

**请求体:**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| nickname | string | 是 | 评论者昵称 |
| email | string | 是 | 评论者邮箱 |
| content | string | 是 | 评论内容 |

**请求示例:**
```bash
curl -X POST http://localhost:8080/api/articles/hello-world/comments \
  -H "Content-Type: application/json" \
  -d '{"nickname": "访客", "email": "guest@example.com", "content": "写得真好！"}'
```

**成功响应:**
```json
{
  "code": 0,
  "msg": "评论提交成功",
  "data": {
    "id": 1,
    "article_id": 1,
    "nickname": "访客",
    "email": "guest@example.com",
    "content": "写得真好！",
    "created_at": "2024-01-01T13:00:00Z"
  }
}
```

**失败响应 (参数校验失败):**
```json
{
  "code": 400,
  "msg": "昵称不能为空",
  "data": null
}
```

## 3. 管理接口（需 JWT 认证）

### 3.1 管理员登录

**POST /api/admin/login**

**请求体:**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 管理员用户名 |
| password | string | 是 | 管理员密码 |

**请求示例:**
```bash
curl -X POST http://localhost:8080/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

**成功响应:**
```json
{
  "code": 0,
  "msg": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**失败响应 (认证失败):**
```json
{
  "code": 401,
  "msg": "用户名或密码错误",
  "data": null
}
```

### 3.2 创建文章

**POST /api/admin/articles**

**请求头:**
```
Authorization: Bearer <token>
```

**请求体:**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 文章标题 |
| slug | string | 是 | URL 标识（唯一） |
| content | string | 是 | Markdown 内容 |
| summary | string | 否 | 文章摘要 |
| tags | string | 否 | 标签，逗号分隔 |

**请求示例:**
```bash
curl -X POST http://localhost:8080/api/admin/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "新文章",
    "slug": "new-article",
    "content": "# 新文章\\n\\n内容",
    "summary": "文章摘要",
    "tags": "技术,博客"
  }'
```

**成功响应:**
```json
{
  "code": 0,
  "msg": "文章创建成功",
  "data": {
    "id": 2,
    "title": "新文章",
    "slug": "new-article",
    "summary": "文章摘要",
    "tags": "技术,博客",
    "content": "# 新文章\n\n内容",
    "html": "<h1>新文章</h1><p>内容</p>",
    "created_at": "2024-01-02T10:00:00Z",
    "updated_at": "2024-01-02T10:00:00Z"
  }
}
```

### 3.3 更新文章

**PUT /api/admin/articles/:slug**

**请求头:**
```
Authorization: Bearer <token>
```

**路径参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| slug | string | 文章的 URL 标识 |

**请求体:**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 文章标题 |
| content | string | 是 | Markdown 内容 |
| summary | string | 否 | 文章摘要 |
| tags | string | 否 | 标签，逗号分隔 |

**请求示例:**
```bash
curl -X PUT http://localhost:8080/api/admin/articles/new-article \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "更新后的标题",
    "content": "# 更新后的标题\\n\\n更新后的内容",
    "summary": "更新后的摘要",
    "tags": "技术"
  }'
```

**成功响应:**
```json
{
  "code": 0,
  "msg": "文章更新成功",
  "data": null
}
```

### 3.4 删除文章

**DELETE /api/admin/articles/:slug**

**请求头:**
```
Authorization: Bearer <token>
```

**路径参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| slug | string | 文章的 URL 标识 |

**请求示例:**
```bash
curl -X DELETE http://localhost:8080/api/admin/articles/new-article \
  -H "Authorization: Bearer <token>"
```

**成功响应:**
```json
{
  "code": 0,
  "msg": "文章删除成功",
  "data": null
}
```

### 3.5 获取所有评论（管理端）

**GET /api/admin/comments**

**请求头:**
```
Authorization: Bearer <token>
```

**请求示例:**
```bash
curl http://localhost:8080/api/admin/comments \
  -H "Authorization: Bearer <token>"
```

**成功响应:**
```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "article_id": 1,
      "nickname": "访客",
      "email": "guest@example.com",
      "content": "写得真好！",
      "created_at": "2024-01-01T13:00:00Z"
    }
  ]
}
```

### 3.6 删除评论

**DELETE /api/admin/comments/:id**

**请求头:**
```
Authorization: Bearer <token>
```

**路径参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 评论 ID |

**请求示例:**
```bash
curl -X DELETE http://localhost:8080/api/admin/comments/1 \
  -H "Authorization: Bearer <token>"
```

**成功响应:**
```json
{
  "code": 0,
  "msg": "评论删除成功",
  "data": null
}
```

### 3.7 获取标签列表

**GET /api/admin/tags**

**请求头:**
```
Authorization: Bearer <token>
```

**请求示例:**
```bash
curl http://localhost:8080/api/admin/tags \
  -H "Authorization: Bearer <token>"
```

**成功响应:**
```json
{
  "code": 0,
  "msg": "success",
  "data": ["技术", "博客", "生活"]
}
```

## 4. 错误码说明

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（登录失败或 token 无效） |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |