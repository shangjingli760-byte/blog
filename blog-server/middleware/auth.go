// JWT 认证中间件，保护管理端 API
package middleware

import (
	"blog-server/config"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "msg": "未授权"})
			c.Abort()
			return
		}
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

		// 解析并验证 JWT，指定允许的签名算法防止算法混淆攻击
		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
			// 验证签名算法是否为 HS256
			if t.Method.Alg() != jwt.SigningMethodHS256.Alg() {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(cfg.JWTSecret), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "msg": "token 无效或已过期"})
			c.Abort()
			return
		}
		c.Next()
	}
}
