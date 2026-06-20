# Blog 管理技能

本目录包含三个管理技能的 Skill 文件，用于通过 Claude 对话操作 Blog 后端。

## 技能列表

### `blog-auth` — 管理员登录

**功能：** 登录 Blog 管理后台，获取 JWT token。

| 操作 | 说明 |
|------|------|
| 登录 | `POST /api/admin/login` 获取 24 小时有效 token |

**触发：** 任何管理操作之前，或提示"未授权 / 401"时。

---

### `blog-articles` — 文章管理

**功能：** 发布、编辑、删除文章。

| 操作 | 请求 | 说明 |
|------|------|------|
| 发布文章 | `POST /api/admin/articles` | 新建文章，goldmark 自动渲染 Markdown |
| 编辑文章 | `PUT /api/admin/articles/{slug}` | 更新已有文章 |
| 删除文章 | `DELETE /api/admin/articles/{slug}` | 删除文章及关联评论（事务） |

**Slug 命名规则：** 中文标题 → 英文、全小写、连字符分隔（如 `go-concurrency-intro`）

**触发：** "发布一篇文章"、"新建文章"、"编辑文章"、"删除文章"、"把这个写成博客"

---

### `blog-comments` — 评论管理

**功能：** 查看、删除评论。

| 操作 | 请求 | 说明 |
|------|------|------|
| 评论列表 | `GET /api/admin/comments?page&page_size` | 分页查看所有评论 |
| 删除评论 | `DELETE /api/admin/comments/{id}` | 按 ID 删除单条评论 |

**触发：** "查看评论"、"删除评论"、"管理评论"

---

## 调用关系

```
blog-auth (登录)
    │
    └──→ blog-articles (需要 token)
    └──→ blog-comments (需要 token)
```

所有管理操作必须先用 `blog-auth` 获取 token，再传给其他技能。

## 示例对话

> 用户："帮我发布一篇文章，标题是 Docker 入门"

Claude 自动：
1. 调用 `blog-auth` → 登录获取 token
2. 调用 `blog-articles` → 生成 slug、发布文章
3. 验证公开 API 可访问
