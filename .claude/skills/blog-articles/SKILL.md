---
name: blog-articles
description: Use when creating, editing, or deleting blog articles. Requires JWT token from blog-auth skill first.
---

# Blog 文章管理

## 前置条件

先执行 `blog-auth` 登录获取 token：
```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | node -e "process.stdin.on('data',d=>process.stdout.write(JSON.parse(d).data.token))")
```

## Slug 规则

中文标题 → 英文 slug。全小写，单词间用 `-`，只含字母/数字/连字符。
例：`"Go 并发编程入门"` → `go-concurrency-intro`

---

## 发布文章

```
POST /api/admin/articles
Authorization: Bearer {token}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 标题 |
| slug | string | 是 | URL 标识（英文） |
| content | string | 是 | Markdown 正文 |
| summary | string | 否 | 摘要 |
| tags | string | 否 | 标签，逗号分隔 |

```bash
curl -s -X POST http://localhost:8080/api/admin/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d @/tmp/payload.json
```

> `html` 字段由 goldmark 自动渲染，无需手动传。
> Slug 重复返回 400。

---

## 编辑文章

```
PUT /api/admin/articles/{slug}
Authorization: Bearer {token}
```

请求体格式同发布。更新已有文章的全部字段。

```bash
curl -s -X PUT http://localhost:8080/api/admin/articles/{slug} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d @/tmp/payload.json
```

---

## 删除文章

```
DELETE /api/admin/articles/{slug}
Authorization: Bearer {token}
```

```bash
curl -s -X DELETE http://localhost:8080/api/admin/articles/{slug} \
  -H "Authorization: Bearer $TOKEN"
```

> 删除文章同时删除其下所有评论（事务保证）。

---

## 中文编码注意

Windows 终端 curl 可能损坏中文。用 Python 写 JSON 文件再发送：

```bash
python3 -c "
import json
with open('/tmp/payload.json','w',encoding='utf-8') as f:
    json.dump({'title':'标题','slug':'slug','content':'正文','summary':'摘要','tags':'标签'},f,ensure_ascii=False)
"
```
