// 健康检查接口，供 Hermes 采集服务状态及数据库连接情况
package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type HealthHandler struct {
	db *gorm.DB
}

func NewHealthHandler(db *gorm.DB) *HealthHandler {
	return &HealthHandler{db: db}
}

// GET /api/health - 返回服务状态及数据库连接情况
func (h *HealthHandler) Check(c *gin.Context) {
	sqlDB, err := h.db.DB()
	dbStatus := "connected"
	if err != nil || sqlDB.Ping() != nil {
		dbStatus = "disconnected"
	}
	c.JSON(http.StatusOK, gin.H{
		"code":     0,
		"msg":      "success",
		"status":   "running",
		"database": dbStatus,
	})
}
