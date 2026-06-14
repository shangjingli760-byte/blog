import sqlite3

conn = sqlite3.connect(r"D:\GIT\test\blog\blog-server\data\blog.db")
cur = conn.cursor()
now = "2026-06-14T12:00:00+08:00"

articles = [
    {
        "title": "Next.js 14 全栈开发实战",
        "slug": "nextjs-14-fullstack",
        "content": "# Next.js 14 全栈开发实战\n\nNext.js 14 带来了全新的 **Server Actions** 和 **Partial Prerendering**，让全栈开发更加简单。\n\n## 核心特性\n\n- Server Components 默认开启\n- 流式渲染支持\n- 全新的 App Router\n\n## 实战案例\n\n```tsx\nexport default async function Page() {\n  const data = await fetch(\"https://api.example.com\");\n  return <div>{data}</div>;\n}\n```\n\n更多内容请关注后续更新。",
        "summary": "深入探索 Next.js 14 的新特性，包括 Server Actions、Partial Prerendering 和 App Router 的最佳实践。",
        "tags": "Next.js,React,全栈,前端"
    },
    {
        "title": "Go 语言微服务架构设计",
        "slug": "go-microservices-architecture",
        "content": "# Go 语言微服务架构设计\n\nGo 语言凭借其**高性能**和**简洁语法**，成为微服务开发的首选语言之一。\n\n## 架构原则\n\n1. 单一职责\n2. 服务自治\n3. 去中心化治理\n\n## 技术栈\n\n- **Gin** - HTTP 框架\n- **GORM** - ORM 框架\n- **Zap** - 日志库\n\n> 好的架构是演化出来的，不是设计出来的。",
        "summary": "使用 Go 语言构建微服务架构的完整指南，涵盖 Gin、GORM、Zap 等核心库的选型与实践。",
        "tags": "Go,微服务,架构,后端"
    },
    {
        "title": "AI 大模型应用开发入门",
        "slug": "ai-llm-development",
        "content": "# AI 大模型应用开发入门\n\n2024 年是 AI 应用爆发的一年，**LLM** 正在改变软件开发的方式。\n\n## 核心概念\n\n- Prompt Engineering\n- RAG（检索增强生成）\n- Fine-tuning\n\n## 工具推荐\n\n- **LangChain** - LLM 应用框架\n- **Ollama** - 本地模型运行\n- **Vector DB** - 向量数据库\n\n## 示例代码\n\n```python\nfrom openai import OpenAI\nclient = OpenAI()\nresponse = client.chat.completions.create(\n    model=\"gpt-4\",\n    messages=[{\"role\": \"user\", \"content\": \"Hello\"}]\n)\n```",
        "summary": "从零开始学习 AI 大模型应用开发，掌握 Prompt Engineering、RAG 和 Fine-tuning 等核心技术。",
        "tags": "AI,LLM,Python,机器学习"
    },
    {
        "title": "CSS 现代布局完全指南",
        "slug": "css-modern-layout",
        "content": "# CSS 现代布局完全指南\n\n现代 CSS 布局已经告别了 **float** 时代，迎来了 Flexbox 和 Grid 的黄金时代。\n\n## Flexbox 布局\n\n适用于**一维**布局场景：\n\n- 导航栏\n- 卡片列表\n- 居中对齐\n\n## Grid 布局\n\n适用于**二维**布局场景：\n\n- 页面整体布局\n- 复杂网格\n- 响应式设计\n\n## 实用技巧\n\n```css\n.container {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n  gap: 1rem;\n}\n```\n\n配合 Tailwind CSS 使用效果更佳。",
        "summary": "掌握 Flexbox 和 Grid 两大现代布局方案，告别 float 时代，写出优雅的响应式布局代码。",
        "tags": "CSS,Flexbox,Grid,前端"
    },
    {
        "title": "SQLite 在生产环境中的最佳实践",
        "slug": "sqlite-production-best-practices",
        "content": "# SQLite 在生产环境中的最佳实践\n\nSQLite 不仅仅是一个**嵌入式数据库**，它在生产环境中同样表现出色。\n\n## 为什么选择 SQLite\n\n- 零配置，无需独立服务\n- 单文件存储，备份简单\n- 支持全文搜索\n- WAL 模式提升并发\n\n## 性能优化\n\n```sql\nPRAGMA journal_mode=WAL;\nPRAGMA synchronous=NORMAL;\nPRAGMA cache_size=-64000;\n```\n\n## 适用场景\n\n- 个人博客\n- 小型 SaaS\n- 边缘计算\n- IoT 设备\n\n> SQLite 是地球上部署最广泛的数据库引擎。",
        "summary": "探索 SQLite 在生产环境中的性能优化、并发处理和数据安全最佳实践，让小型数据库发挥大作用。",
        "tags": "SQLite,数据库,后端,性能优化"
    },
    {
        "title": "TypeScript 高级类型体操",
        "slug": "typescript-advanced-types",
        "content": "# TypeScript 高级类型体操\n\nTypeScript 的类型系统是**图灵完备**的，掌握高级类型能大幅提升代码质量。\n\n## 条件类型\n\n```typescript\ntype IsString<T> = T extends string ? true : false;\n```\n\n## 映射类型\n\n```typescript\ntype Readonly<T> = {\n  readonly [P in keyof T]: T[P];\n};\n```\n\n## 模板字面量类型\n\n```typescript\ntype EventName<T extends string> = `on${Capitalize<T>}`;\n```\n\n## 实战技巧\n\n- 使用 `infer` 提取类型\n- 联合类型的分布式特性\n- `never` 的过滤能力",
        "summary": "深入 TypeScript 类型系统，学习条件类型、映射类型、模板字面量等高级技巧，写出更安全的代码。",
        "tags": "TypeScript,前端,类型系统,编程"
    },
]

for a in articles:
    cur.execute(
        "INSERT OR IGNORE INTO articles (title, slug, content, html, summary, tags, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (a["title"], a["slug"], a["content"], "<p>Loading...</p>", a["summary"], a["tags"], now, now)
    )
    print(f"Inserted: {a['title']}")

conn.commit()
cur.execute("SELECT COUNT(*) FROM articles")
print(f"Total articles: {cur.fetchone()[0]}")
conn.close()
