// 墓碑接口处理层
package handler

import (
	"net/http"
	"strconv"

	"blog-server/model"
	"blog-server/service"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type TombHandler struct {
	svc    *service.TombService
	logger *zap.Logger
}

func NewTombHandler(svc *service.TombService, logger *zap.Logger) *TombHandler {
	return &TombHandler{svc: svc, logger: logger}
}

// GET /api/tombs - 获取墓碑列表
func (h *TombHandler) List(c *gin.Context) {
	tombs, err := h.svc.GetTombs()
	if err != nil {
		h.logger.Error("获取墓碑列表失败", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "msg": "服务端错误"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 0, "msg": "success", "data": tombs})
}

// GET /api/tombs/:id - 获取墓碑详情（含统计）
func (h *TombHandler) Detail(c *gin.Context) {
	id := c.Param("id")
	tomb, err := h.svc.GetTombByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "msg": "墓碑不存在"})
		return
	}
	stats, err := h.svc.GetTombStats(id)
	if err != nil {
		h.logger.Error("获取墓碑统计失败", zap.String("id", id), zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "msg": "获取统计信息失败"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 0, "msg": "success", "data": gin.H{
		"tomb":  tomb,
		"stats": stats,
	}})
}

// POST /api/tombs - 创建墓碑
func (h *TombHandler) Create(c *gin.Context) {
	var tomb model.Tomb
	if err := c.ShouldBindJSON(&tomb); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "msg": "参数错误"})
		return
	}
	if err := h.svc.CreateTomb(&tomb); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "msg": err.Error()})
		return
	}
	h.logger.Info("创建墓碑成功", zap.String("name", tomb.Name))
	c.JSON(http.StatusOK, gin.H{"code": 0, "msg": "墓碑已立", "data": tomb})
}

// DELETE /api/tombs/:id - 删除墓碑
func (h *TombHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.svc.DeleteTomb(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "msg": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 0, "msg": "墓碑已移除"})
}

// ---- 扫墓 ----

// GET /api/tombs/:id/visits - 获取扫墓记录
func (h *TombHandler) ListVisits(c *gin.Context) {
	id := c.Param("id")
	visits, err := h.svc.GetVisits(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "msg": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 0, "msg": "success", "data": visits})
}

// POST /api/tombs/:id/visits - 扫墓
func (h *TombHandler) CreateVisit(c *gin.Context) {
	id := c.Param("id")
	var visit model.TombVisit
	if err := c.ShouldBindJSON(&visit); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "msg": "参数错误"})
		return
	}
	idUint, err := parseUint(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "msg": "墓碑 ID 格式错误"})
		return
	}
	visit.TombID = idUint
	if err := h.svc.CreateVisit(&visit); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "msg": err.Error()})
		return
	}
	h.logger.Info("扫墓成功", zap.Uint("tomb_id", visit.TombID), zap.String("visitor", visit.Visitor))
	c.JSON(http.StatusOK, gin.H{"code": 0, "msg": "扫墓成功", "data": visit})
}

// ---- 来访者 ----

// POST /api/tombs/:id/visitors - 记录来访者
func (h *TombHandler) RecordVisitor(c *gin.Context) {
	id := c.Param("id")
	var v model.TombVisitor
	if err := c.ShouldBindJSON(&v); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "msg": "参数错误"})
		return
	}
	idUint, err := parseUint(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "msg": "墓碑 ID 格式错误"})
		return
	}
	v.TombID = idUint
	if err := h.svc.RecordVisitor(&v); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "msg": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 0, "msg": "success", "data": v})
}

// GET /api/tombs/:id/visitors - 获取来访者列表
func (h *TombHandler) ListVisitors(c *gin.Context) {
	id := c.Param("id")
	visitors, err := h.svc.GetVisitors(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "msg": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 0, "msg": "success", "data": visitors})
}

// GET /api/tombs/:id/stats - 获取墓碑统计
func (h *TombHandler) Stats(c *gin.Context) {
	id := c.Param("id")
	stats, err := h.svc.GetTombStats(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "msg": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 0, "msg": "success", "data": stats})
}

// 辅助函数
func parseUint(s string) (uint, error) {
	id, err := strconv.ParseUint(s, 10, 64)
	return uint(id), err
}
