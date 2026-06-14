# 后端服务架构

## 1. 目录结构

```
blog-server/
├── main.go              # 项目入口
├── go.mod               # 模块依赖
├── config/
│   └── config.go        # 配置管理
├── router/
│   └── router.go        # 路由注册
├── handler/
│   ├── admin.go         # 管理端接口
│   ├── article.go       # 文章接口
│   ├── comment.go       # 评论接口
│   └── health.go        # 健康检查
├── service/
│   ├── article.go       # 文章业务逻辑
│   └── comment.go       # 评论业务逻辑
├── repository/
│   ├── article.go       # 文章数据访问
│   └── comment.go       # 评论数据访问
├── model/
│   ├── article.go       # 文章模型
│   └── comment.go       # 评论模型
└── middleware/
    ├── auth.go          # JWT认证
    ├── cors.go          # 跨域处理
    ├── logger.go        # 请求日志
    └── recovery.go      # Panic恢复
```

## 2. 启动流程

```
main.go 启动流程:
  1. config.Load() → 读取环境变量配置
  2. zap.NewProduction() → 初始化日志
  3. gorm.Open(sqlite.Open(dbPath)) → 连接数据库
  4. db.AutoMigrate(&Article{}, &Comment{}) → 自动迁移表结构
  5. 构造依赖链: Repository → Service → Handler
  6. router.Setup() → 注册路由和中间件
  7. r.Run(addr) → 启动HTTP服务
```

## 3. 配置管理

### 3.1 配置项

| 环境变量 | 默认值 | 说明 |
|----------|--------|------|
| PORT | 8080 | 服务端口 |
| DB_PATH | ./data/blog.db | SQLite数据库路径 |
| JWT_SECRET | blog-jwt-secret-change-in-production | JWT密钥 |
| ADMIN_USER | admin | 管理员用户名 |
| ADMIN_PASSWORD | admin123 | 管理员密码 |

### 3.2 配置加载顺序

1. 环境变量优先
2. 无环境变量时使用默认值

## 4. 中间件链

```
请求 → Logger → Recovery → CORS → Auth(仅/admin) → Handler → Response
```

### 4.1 LoggerMiddleware

- 记录请求方法、路径、状态码、耗时
- 使用 zap 结构化日志

### 4.2 RecoveryMiddleware

- 捕获 panic，避免服务崩溃
- 返回 500 错误响应

### 4.3 CORS

- 允许所有来源
- 支持 GET/POST/PUT/DELETE/OPTIONS
- 允许 Content-Type、Authorization 头

### 4.4 AuthMiddleware

- 从 Authorization 头提取 Bearer Token
- 验证 JWT 签名和有效期
- 失败返回 401 状态码

## 5. 路由设计

### 5.1 公开 API（无需认证）

| 方法 | 路径 | Handler | 说明 |
|------|------|---------|------|
| GET | /api/health | healthH.Check | 健康检查 |
| GET | /api/articles | articleH.List | 文章列表 |
| GET | /api/articles/:slug | articleH.Detail | 文章详情 |
| GET | /api/articles/:slug/comments | commentH.List | 文章评论列表 |
| POST | /api/articles/:slug/comments | commentH.Create | 提交评论 |

### 5.2 管理 API（需 JWT 认证）

| 方法 | 路径 | Handler | 说明 |
|------|------|---------|------|
| POST | /api/admin/login | adminH.Login | 管理员登录 |
| POST | /api/admin/articles | adminH.CreateArticle | 创建文章 |
| PUT | /api/admin/articles/:slug | adminH.UpdateArticle | 更新文章 |
| DELETE | /api/admin/articles/:slug | adminH.DeleteArticle | 删除文章 |
| GET | /api/admin/comments | adminH.ListComments | 评论列表 |
| DELETE | /api/admin/comments/:id | adminH.DeleteComment | 删除评论 |
| GET | /api/admin/tags | adminH.ListTags | 标签列表 |

## 6. Handler 层

### 6.1 职责

- 参数解析（路径参数、查询参数、请求体）
- 调用 Service 层
- 返回统一格式响应

### 6.2 响应格式

```json
{
  "code": 0,      // 0 表示成功，非0表示错误码
  "msg": "ok",    // 提示信息
  "data": {}      // 数据内容
}
```

## 7. Service 层

### 7.1 职责

- 业务逻辑封装
- 参数校验
- 事务管理

### 7.2 ArticleService

| 方法 | 功能 |
|------|------|
| GetArticles() | 获取所有文章 |
| GetArticleBySlug(slug) | 通过slug获取文章 |
| CreateArticle(article) | 创建文章（校验必填字段） |
| UpdateArticle(article) | 更新文章（校验必填字段） |
| DeleteArticle(id) | 删除文章 |

### 7.3 CommentService

| 方法 | 功能 |
|------|------|
| GetComments(articleID) | 获取文章评论列表 |
| CreateComment(comment) | 创建评论（校验昵称、邮箱、内容） |
| DeleteComment(id) | 删除评论 |

## 8. Repository 层

### 8.1 职责

- 数据库 CRUD 操作封装
- GORM 查询构建

### 8.2 ArticleRepository

| 方法 | GORM操作 |
|------|----------|
| FindAll() | db.Order("created_at DESC").Find() |
| FindBySlug(slug) | db.Where("slug = ?", slug).First() |
| Create(article) | db.Create() |
| Update(article) | db.Save() |
| Delete(id) | db.Delete(&Article{}, id) |

### 8.3 CommentRepository

| 方法 | GORM操作 |
|------|----------|
| FindByArticleID(articleID) | db.Where("article_id = ?").Order("created_at DESC").Find() |
| Create(comment) | db.Create() |
| Delete(id) | db.Delete(&Comment{}, id) |

## 9. 依赖注入

采用构造函数注入，依赖关系在 main.go 中显式组装：

```
repository.NewArticleRepository(db) → service.NewArticleService(articleRepo) → handler.NewArticleHandler(articleSvc, logger)
repository.NewCommentRepository(db) → service.NewCommentService(commentRepo) → handler.NewCommentHandler(commentSvc, articleSvc, logger)
```

## 10. 安全注意事项

1. 密码使用 MD5 哈希，建议改用 bcrypt
2. JWT Secret 在生产环境应使用强随机字符串
3. AdminHandler 部分操作直接使用 db，破坏分层一致性
4. 评论与文章之间建议添加数据库级外键约束