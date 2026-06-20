---
name: blog-auth
description: Use when needing admin access to the blog API - login to get JWT token for other admin operations
---

# Blog 管理员登录

获取 JWT token，后续所有管理操作都需要。

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | node -e "process.stdin.on('data',d=>process.stdout.write(JSON.parse(d).data.token))")
```

| 字段 | 值 |
|------|-----|
| URL | `POST /api/admin/login` |
| 认证 | 无需 |
| 返回 | `{code, msg, data: {token}}` |
| token 有效期 | 24 小时 |

**错误：** 用户/密码错 → `401 "用户名或密码错误"`
