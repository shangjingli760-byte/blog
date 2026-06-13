// Panic 恢复中间件，捕获 panic 并记录错误日志，避免服务崩溃
package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func RecoveryMiddleware(logger *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				logger.Error("panic 恢复", zap.Any("error", err))
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
					"code": 500,
					"msg":  "服务端错误",
				})
			}
		}()
		c.Next()
	}
}
