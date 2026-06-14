# 开发与部署指南

## 1. 开发环境准备

### 1.1 系统要求

| 软件 | 版本 | 说明 |
|------|------|------|
| Go | >= 1.21 | 后端开发 |
| Node.js | >= 18 | 前端开发 |
| Hugo | >= 0.120 | 静态博客生成 |
| Git | >= 2.0 | 版本控制 |

### 1.2 安装步骤

#### 1.2.1 Go 安装

```bash
# Windows (使用 Chocolatey)
choco install golang

# macOS (使用 Homebrew)
brew install go

# 验证安装
go version
```

#### 1.2.2 Node.js 安装

```bash
# Windows (使用 Chocolatey)
choco install nodejs

# macOS (使用 Homebrew)
brew install node

# 验证安装
node --version
npm --version
```

#### 1.2.3 Hugo 安装

```bash
# Windows (使用 Chocolatey)
choco install hugo-extended

# macOS (使用 Homebrew)
brew install hugo

# 验证安装
hugo version
```

## 2. 项目结构

```
blog/
├── blog-server/          # Go 后端服务
├── blog-web/             # Next.js 前端
├── blog-hugo/            # Hugo 静态博客（与根目录内容一致）
├── congo/                # Congo 主题
└── docs/                 # 技术文档
```

## 3. 后端开发

### 3.1 启动开发服务器

```bash
cd blog-server

# 安装依赖
go mod download

# 启动开发服务器（默认端口 8080）
go run main.go

# 或设置环境变量
PORT=8080 go run main.go
```

### 3.2 环境变量配置

| 变量 | 默认值 | 说明 |
|------|--------|------|
| PORT | 8080 | 服务端口 |
| DB_PATH | ./data/blog.db | SQLite 数据库路径 |
| JWT_SECRET | blog-jwt-secret-change-in-production | JWT 密钥 |
| ADMIN_USER | admin | 管理员用户名 |
| ADMIN_PASSWORD | admin123 | 管理员密码 |

### 3.3 构建生产版本

```bash
cd blog-server

# 构建可执行文件
go build -o blog-server .

# 运行
./blog-server
```

### 3.4 代码结构

```
blog-server/
├── main.go              # 入口文件
├── config/              # 配置管理
├── router/              # 路由注册
├── handler/             # HTTP 处理器
├── service/             # 业务逻辑
├── repository/          # 数据访问
├── model/               # 数据模型
└── middleware/          # 中间件
```

### 3.5 开发规范

1. **命名规范**：使用驼峰命名法（CamelCase），文件名使用小写加下划线。
2. **错误处理**：使用 `errors.New()` 创建错误，统一返回格式。
3. **日志记录**：使用 zap 日志库，记录关键操作和错误。
4. **代码风格**：使用 `gofmt` 格式化代码。

## 4. 前端开发

### 4.1 启动开发服务器

```bash
cd blog-web

# 安装依赖
npm install

# 启动开发服务器（默认端口 3000）
npm run dev

# 或设置 API 地址
NEXT_PUBLIC_API_URL=http://localhost:8080 npm run dev
```

### 4.2 环境变量配置

| 变量 | 默认值 | 说明 |
|------|--------|------|
| NEXT_PUBLIC_API_URL | http://localhost:8080 | 后端 API 地址 |

### 4.3 构建生产版本

```bash
cd blog-web

# 构建静态文件（输出到 out/ 目录）
npm run build

# 预览构建结果
npm run start
```

### 4.4 代码结构

```
blog-web/
├── app/                 # App Router 页面
├── components/          # React 组件
├── hooks/               # 自定义 Hooks
├── lib/                 # API 封装
├── next.config.js       # Next.js 配置
├── tailwind.config.js   # Tailwind 配置
└── tsconfig.json        # TypeScript 配置
```

### 4.5 开发规范

1. **类型安全**：使用 TypeScript 严格模式。
2. **组件拆分**：按功能拆分组件，保持单一职责。
3. **代码风格**：使用 ESLint 和 Prettier 格式化代码。
4. **API 封装**：统一在 `lib/` 目录封装 API 调用。

## 5. Hugo 开发

### 5.1 启动开发服务器

```bash
cd blog-hugo  # 或 cd blog（根目录包含相同内容）

# 启动开发服务器（默认端口 1313）
hugo server

# 带实时预览
hugo server --watch

# 生成静态文件
hugo

# 输出到指定目录
hugo -d public
```

### 5.2 配置文件

**hugo.toml** 主要配置项：

```toml
baseURL = "https://yourdomain.com/"
languageCode = "zh-cn"
title = "My Blog"
theme = "congo"

[params]
colorScheme = "congo"
homeLayout = "page"
showComments = true
```

### 5.3 创建新文章

```bash
# 使用默认模板创建文章
hugo new posts/my-new-post.md

# 创建页面
hugo new about.md
```

### 5.4 文章 Front Matter

```yaml
---
title: "文章标题"
date: 2024-01-01
tags: ["技术", "博客"]
categories: ["生活"]
showComments: true
---
```

### 5.5 主题自定义

**自定义样式**：编辑 `assets/css/custom.css`

**自定义模板**：在 `layouts/` 目录添加或修改模板文件

## 6. 部署指南

### 6.1 后端部署

#### 6.1.1 使用 systemd（Linux）

创建 `/etc/systemd/system/blog-server.service`：

```ini
[Unit]
Description=Blog Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/blog/blog-server
ExecStart=/var/www/blog/blog-server/blog-server
Environment=PORT=8080
Environment=DB_PATH=/var/www/blog/blog-server/data/blog.db
Environment=JWT_SECRET=your-strong-secret-here
Environment=ADMIN_USER=admin
Environment=ADMIN_PASSWORD=your-strong-password

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
sudo systemctl daemon-reload
sudo systemctl enable blog-server
sudo systemctl start blog-server
```

#### 6.1.2 使用 Docker

创建 `Dockerfile`：

```dockerfile
FROM golang:1.21-alpine

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o blog-server .

EXPOSE 8080

CMD ["./blog-server"]
```

构建并运行：

```bash
docker build -t blog-server .
docker run -p 8080:8080 -v $(pwd)/data:/app/data blog-server
```

### 6.2 前端部署

#### 6.2.1 静态部署

```bash
# 构建
cd blog-web
npm run build

# 部署到 Nginx
cp -r out/* /var/www/blog-web/
```

#### 6.2.2 Nginx 配置

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    root /var/www/blog-web;
    index index.html;

    # 前端路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 6.3 Hugo 部署

```bash
# 构建
hugo -d public

# 部署到 Nginx
cp -r public/* /var/www/hugo-blog/
```

### 6.4 完整部署架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Nginx (反向代理)                        │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │  /          │    │  /api/*     │    │  /admin/*   │    │
│  │  静态文件    │    │  blog-server│    │  Hugo admin │    │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    │
│         ▼                  ▼                  ▼            │
│  /var/www/blog-web    localhost:8080    /var/www/hugo     │
│  (Next.js 静态输出)   (Go 后端服务)    (Hugo 静态输出)    │
│                                                   │        │
│                                                   ▼        │
│                                          SQLite (blog.db)  │
└─────────────────────────────────────────────────────────────┘
```

## 7. 数据库管理

### 7.1 查看数据库

```bash
# 使用 sqlite3 命令行工具
sqlite3 data/blog.db

# 查看表结构
.schema articles
.schema comments

# 查询文章
SELECT * FROM articles;

# 查询评论
SELECT * FROM comments;
```

### 7.2 备份数据库

```bash
# 创建备份
sqlite3 data/blog.db ".backup backup/blog.db.backup"

# 恢复备份
sqlite3 data/blog.db ".restore backup/blog.db.backup"
```

## 8. 安全建议

1. **生产环境配置**：
   - 使用强密码（ADMIN_PASSWORD）
   - 使用强 JWT Secret（JWT_SECRET）
   - 禁止使用默认配置

2. **HTTPS**：
   - 使用 Let's Encrypt 配置 SSL
   - 强制 HTTPS 访问

3. **CORS 配置**：
   - 生产环境限制允许的来源
   - 不使用 `*` 通配符

4. **日志管理**：
   - 定期清理日志
   - 不记录敏感信息

## 9. 故障排查

### 9.1 后端服务无法启动

```bash
# 检查端口是否被占用
netstat -tlnp | grep 8080

# 查看日志
journalctl -u blog-server

# 检查数据库目录权限
ls -la data/
```

### 9.2 前端无法访问 API

```bash
# 检查 API 服务是否运行
curl http://localhost:8080/api/health

# 检查 CORS 配置
curl -I http://localhost:8080/api/articles
```

### 9.3 Hugo 构建失败

```bash
# 检查主题配置
hugo config

# 查看错误详情
hugo --verbose
```