// 评论接口处理层，负责参数校验、通过 slug 查找文章后调用 Service、返回统一响应
package handler

import (
	"net/http"

	"blog-server/model"
	"blog-server/service"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type CommentHandler struct {
	svc        *service.CommentService
	articleSvc *service.ArticleService
	logger     *zap.Logger
}

func NewCommentHandler(svc *service.CommentService, articleSvc *service.ArticleService, logger *zap.Logger) *CommentHandler {
	return &CommentHandler{svc: svc, articleSvc: articleSvc, logger: logger}
}

// 通过 slug 查找文章，统一返回 404
func (h *CommentHandler) getArticleBySlug(c *gin.Context) (*model.Article, bool) {
	slug := c.Param("slug")
	article, err := h.articleSvc.GetArticleBySlug(slug)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "msg": "文章不存在"})
		return nil, false
	}
	return article, true
}

// GET /api/articles/:slug/comments - 获取文章评论列表
func (h *CommentHandler) List(c *gin.Context) {
	article, ok := h.getArticleBySlug(c)
	if !ok {
		return
	}
	comments, err := h.svc.GetComments(article.ID)
	if err != nil {
		h.logger.Error("获取评论列表失败", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "msg": "服务端错误"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 0, "msg": "success", "data": comments})
}

// POST /api/articles/:slug/comments - 创建评论
func (h *CommentHandler) Create(c *gin.Context) {
	article, ok := h.getArticleBySlug(c)
	if !ok {
		return
	}
	var comment model.Comment
	if err := c.ShouldBindJSON(&comment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "msg": "参数错误"})
		return
	}
	comment.ArticleID = article.ID
	if err := h.svc.CreateComment(&comment); err != nil {
		h.logger.Error("创建评论失败", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "msg": err.Error()})
		return
	}
	// 日志中不输出邮箱等敏感信息
	h.logger.Info("创建评论成功", zap.Uint("article_id", comment.ArticleID))
	c.JSON(http.StatusOK, gin.H{"code": 0, "msg": "success", "data": comment})
}
