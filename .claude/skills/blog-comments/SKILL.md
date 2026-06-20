---
name: blog-comments
description: Use when viewing or deleting comments in the admin panel. Requires JWT token from blog-auth skill first.
---

# Blog 评论管理

## 前置条件

先执行 `blog-auth` 登录获取 token：
```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | node -e "process.stdin.on('data',d=>process.stdout.write(JSON.parse(d).data.token))")
```

---

## 评论列表（分页）

```
GET /api/admin/comments?page={n}&page_size={n}
Authorization: Bearer {token}
```

| 参数 | 默认 | 说明 |
|------|------|------|
| page | 1 | 页码 |
| page_size | 20 | 每页数量（最大 100） |

```bash
curl -s "http://localhost:8080/api/admin/comments?page=1&page_size=20" \
  -H "Authorization: Bearer $TOKEN"
```

**返回：**
```json
{ "code": 0, "data": { "list": [...], "total": 2, "page": 1, "page_size": 20 } }
```

每条评论包含：`id`, `article_id`, `nickname`, `email`, `content`, `created_at`

---

## 删除评论

```
DELETE /api/admin/comments/{id}
Authorization: Bearer {token}
```

```bash
curl -s -X DELETE http://localhost:8080/api/admin/comments/{id} \
  -H "Authorization: Bearer $TOKEN"
```

> `id` 是评论 ID（数字），从评论列表中获取。
