// 文章接口处理层，负责参数校验、调用 Service、返回统一响应
package handler

import (
	"net/http"

	"blog-server/service"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type ArticleHandler struct {
	svc    *service.ArticleService
	logger *zap.Logger
}

func NewArticleHandler(svc *service.ArticleService, logger *zap.Logger) *ArticleHandler {
	return &ArticleHandler{svc: svc, logger: logger}
}

// GET /api/articles - 获取文章列表
func (h *ArticleHandler) List(c *gin.Context) {
	articles, err := h.svc.GetArticles()
	if err != nil {
		h.logger.Error("获取文章列表失败", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "msg": "服务端错误"})
		return
	}
	h.logger.Info("获取文章列表成功", zap.Int("count", len(articles)))
	c.JSON(http.StatusOK, gin.H{"code": 0, "msg": "success", "data": articles})
}

// GET /api/articles/:slug - 获取文章详情
func (h *ArticleHandler) Detail(c *gin.Context) {
	slug := c.Param("slug")
	article, err := h.svc.GetArticleBySlug(slug)
	if err != nil {
		h.logger.Error("获取文章详情失败", zap.String("slug", slug), zap.Error(err))
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "msg": "文章不存在"})
		return
	}
	h.logger.Info("获取文章详情成功", zap.String("slug", slug))
	c.JSON(http.StatusOK, gin.H{"code": 0, "msg": "success", "data": article})
}
