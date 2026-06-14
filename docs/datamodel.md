# 数据模型

## 1. 数据库概述

本项目使用 SQLite 作为数据库，通过 GORM 进行 ORM 操作。数据库文件默认存储在 `./data/blog.db`。

## 2. 数据表设计

### 2.1 articles 表

**表结构:**

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 主键 ID |
| title | VARCHAR(200) | NOT NULL | 文章标题 |
| slug | VARCHAR(200) | NOT NULL, UNIQUE | URL 唯一标识 |
| content | TEXT | NOT NULL | Markdown 原文 |
| html | TEXT | NOT NULL | 渲染后的 HTML |
| summary | VARCHAR(500) | - | 文章摘要 |
| tags | VARCHAR(500) | - | 逗号分隔的标签 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

**索引:**
- `PRIMARY KEY` ON `id`
- `UNIQUE INDEX` ON `slug`

**Go 模型定义:**

```go
type Article struct {
    ID      uint      `gorm:"primaryKey" json:"id"`
    Title   string    `gorm:"size:200;not null" json:"title"`
    Slug    string    `gorm:"uniqueIndex;size:200;not null" json:"slug"`
    Content string    `gorm:"type:text;not null" json:"content"`
    HTML    string    `gorm:"type:text;not null" json:"html"`
    Summary string    `gorm:"size:500" json:"summary"`
    Tags    string    `gorm:"size:500" json:"tags"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}
```

### 2.2 comments 表

**表结构:**

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 主键 ID |
| article_id | INTEGER | NOT NULL | 关联文章 ID |
| nickname | VARCHAR(100) | NOT NULL | 评论者昵称 |
| email | VARCHAR(200) | NOT NULL | 评论者邮箱 |
| content | TEXT | NOT NULL | 评论内容 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**索引:**
- `PRIMARY KEY` ON `id`
- `INDEX` ON `article_id`

**Go 模型定义:**

```go
type Comment struct {
    ID        uint      `gorm:"primaryKey" json:"id"`
    ArticleID uint      `gorm:"index;not null" json:"article_id"`
    Nickname  string    `gorm:"size:100;not null" json:"nickname"`
    Email     string    `gorm:"size:200;not null" json:"email"`
    Content   string    `gorm:"type:text;not null" json:"content"`
    CreatedAt time.Time `json:"created_at"`
}
```

## 3. 实体关系图

```
┌─────────────────┐       ┌─────────────────┐
│    Article      │       │    Comment      │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ title           │ 1:N   │ article_id (FK) │
│ slug (UNIQUE)   │◄──────│ nickname        │
│ content         │       │ email           │
│ html            │       │ content         │
│ summary         │       │ created_at      │
│ tags            │       └─────────────────┘
│ created_at      │
│ updated_at      │
└─────────────────┘

说明: 一篇文章可以有多个评论（1:N关系）
```

## 4. 数据模型设计说明

### 4.1 设计决策

1. **Slug 作为唯一标识**：文章通过 `slug` 而非数字 ID 进行公开访问，URL 更友好（如 `/articles/hello-world`）。

2. **同时存储 Markdown 和 HTML**：`content` 存储原始 Markdown，`html` 存储渲染后的 HTML，避免每次请求都重新渲染。

3. **标签存储方式**：`tags` 字段使用逗号分隔的字符串存储，而非单独的标签表，简化设计，适合个人博客规模。

4. **评论无更新时间**：评论不支持编辑，因此不需要 `updated_at` 字段。

5. **外键逻辑关联**：`article_id` 作为外键逻辑关联文章，但未在数据库层面强制外键约束（GORM 默认不创建外键）。

### 4.2 潜在改进

| 改进项 | 当前状态 | 建议 |
|--------|----------|------|
| 外键约束 | 逻辑关联 | 添加数据库级外键约束，确保数据完整性 |
| 标签表 | 字符串存储 | 考虑创建独立的标签表和关联表，支持更复杂的标签管理 |
| 密码哈希 | MD5 | 改用 bcrypt 或 scrypt，提高安全性 |
| 评论分页 | 无 | 评论数量多时需要分页支持 |

## 5. 自动迁移

项目启动时会自动执行数据库迁移：

```go
db.AutoMigrate(&model.Article{}, &model.Comment{})
```

此操作会：
- 自动创建不存在的表
- 自动添加新字段（不会删除或修改现有字段）
- 创建必要的索引

## 6. 数据操作示例

### 6.1 创建文章

```go
article := &model.Article{
    Title:   "新文章",
    Slug:    "new-article",
    Content: "# Hello\n\n内容",
    HTML:    "<h1>Hello</h1><p>内容</p>",
    Summary: "文章摘要",
    Tags:    "技术,博客",
}

result := db.Create(article)
```

### 6.2 查询文章

```go
// 通过 slug 查询
var article model.Article
db.Where("slug = ?", "hello-world").First(&article)

// 查询所有文章（按创建时间倒序）
var articles []model.Article
db.Order("created_at DESC").Find(&articles)
```

### 6.3 创建评论

```go
comment := &model.Comment{
    ArticleID: 1,
    Nickname:  "访客",
    Email:     "guest@example.com",
    Content:   "写得真好！",
}

result := db.Create(comment)
```

### 6.4 查询评论

```go
// 查询指定文章的评论
var comments []model.Comment
db.Where("article_id = ?", 1).Order("created_at DESC").Find(&comments)
```

### 6.5 删除文章

```go
// 删除文章（同时会删除关联评论，需手动处理）
db.Delete(&model.Article{}, 1)
```

## 7. JSON 序列化格式

### 7.1 Article JSON

```json
{
  "id": 1,
  "title": "欢迎来到我的博客",
  "slug": "hello-world",
  "content": "# Hello World\n\n欢迎来到我的博客！",
  "html": "<h1>Hello World</h1><p>欢迎来到我的博客！</p>",
  "summary": "这是我的第一篇博客文章",
  "tags": "技术,博客",
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

### 7.2 Comment JSON

```json
{
  "id": 1,
  "article_id": 1,
  "nickname": "访客",
  "email": "guest@example.com",
  "content": "写得真好！",
  "created_at": "2024-01-01T13:00:00Z"
}
```