// 管理端接口处理层：登录、文章 CRUD、评论管理
package handler

import (
	"bytes"
	"net/http"
	"strconv"
	"strings"
	"time"

	"blog-server/config"
	"blog-server/model"
	"blog-server/service"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/yuin/goldmark"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type AdminHandler struct {
	articleSvc *service.ArticleService
	commentSvc *service.CommentService
	db         *gorm.DB
	logger     *zap.Logger
	cfg        *config.Config
}

func NewAdminHandler(articleSvc *service.ArticleService, commentSvc *service.CommentService, db *gorm.DB, logger *zap.Logger, cfg *config.Config) *AdminHandler {
	return &AdminHandler{articleSvc: articleSvc, commentSvc: commentSvc, db: db, logger: logger, cfg: cfg}
}

// POST /api/admin/login - 管理员登录
func (h *AdminHandler) Login(c *gin.Context) {
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "msg": "参数错误"})
		return
	}
	if req.Username != h.cfg.AdminUser {
		h.logger.Warn("登录失败：用户名错误", zap.String("user", req.Username))
		c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "msg": "用户名或密码错误"})
		return
	}
	// 验证密码（生产环境应使用 bcrypt 哈希存储，当前为明文比对）
	if req.Password != h.cfg.AdminPassword {
		h.logger.Warn("登录失败：密码错误", zap.String("user", req.Username))
		c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "msg": "用户名或密码错误"})
		return
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user": req.Username,
		"exp":  time.Now().Add(24 * time.Hour).Unix(),
	})
	tokenStr, err := token.SignedString([]byte(h.cfg.JWTSecret))
	if err != nil {
		h.logger.Error("JWT 签名失败", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "msg": "服务器错误"})
		return
	}
	h.logger.Info("管理员登录成功", zap.String("user", req.Username))
	c.JSON(http.StatusOK, gin.H{"code": 0, "msg": "success", "data": gin.H{"token": tokenStr}})
}

// ========== 文章管理 ==========

// POST /api/admin/articles - 创建文章（goldmark 渲染 Markdown → HTML）
func (h *AdminHandler) CreateArticle(c *gin.Context) {
	var req struct {
		Title   string `json:"title"`
		Slug    string `json:"slug"`
		Content string `json:"content"`
		Summary string `json:"summary"`
		Tags    string `json:"tags"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "msg": "参数错误"})
		return
	}
	article := &model.Article{
		Title:   req.Title,
		Slug:    req.Slug,
		Content: req.Content,
		HTML:    markdownToHTML(req.Content),
		Summary: req.Summary,
		Tags:    req.Tags,
	}
	if err := h.articleSvc.CreateArticle(article); err != nil {
		h.logger.Error("创建文章失败", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "msg": err.Error()})
		return
	}
	h.logger.Info("创建文章成功", zap.String("slug", article.Slug))
	c.JSON(http.StatusOK, gin.H{"code": 0, "msg": "success", "data": article})
}

// PUT /api/admin/articles/:slug - 编辑文章
func (h *AdminHandler) UpdateArticle(c *gin.Context) {
	var req struct {
		Title   string `json:"title"`
		Slug    string `json:"slug"`
		Content string `json:"content"`
		Summary string `json:"summary"`
		Tags    string `json:"tags"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "msg": "参数错误"})
		return
	}
	article, err := h.articleSvc.GetArticleBySlug(c.Param("slug"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "msg": "文章不存在"})
		return
	}
	article.Title = req.Title
	article.Slug = req.Slug
	article.Content = req.Content
	article.HTML = markdownToHTML(req.Content)
	article.Summary = req.Summary
	article.Tags = req.Tags
	if err := h.articleSvc.UpdateArticle(article); err != nil {
		h.logger.Error("更新文章失败", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "msg": err.Error()})
		return
	}
	h.logger.Info("更新文章成功", zap.Uint("id", article.ID))
	c.JSON(http.StatusOK, gin.H{"code": 0, "msg": "success", "data": article})
}

// DELETE /api/admin/articles/:slug - 删除文章（事务：文章+关联评论原子删除）
func (h *AdminHandler) DeleteArticle(c *gin.Context) {
	article, err := h.articleSvc.GetArticleBySlug(c.Param("slug"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "msg": "文章不存在"})
		return
	}
	err = h.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Delete(&model.Article{}, article.ID).Error; err != nil {
			return err
		}
		return tx.Where("article_id = ?", article.ID).Delete(&model.Comment{}).Error
	})
	if err != nil {
		h.logger.Error("删除文章失败", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "msg": "服务端错误"})
		return
	}
	h.logger.Info("删除文章成功", zap.Uint("id", article.ID))
	c.JSON(http.StatusOK, gin.H{"code": 0, "msg": "success"})
}

// ========== 评论管理 ==========

// GET /api/admin/comments - 评论列表（分页）
func (h *AdminHandler) ListComments(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize

	var comments []model.Comment
	var total int64
	h.db.Model(&model.Comment{}).Count(&total)
	h.db.Order("created_at DESC").Limit(pageSize).Offset(offset).Find(&comments)

	h.logger.Debug("获取评论列表", zap.Int("count", len(comments)), zap.Int("page", page))
	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"msg":  "success",
		"data": gin.H{
			"list":      comments,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

// DELETE /api/admin/comments/:id - 删除评论
func (h *AdminHandler) DeleteComment(c *gin.Context) {
	id := c.Param("id")
	if err := h.commentSvc.DeleteComment(id); err != nil {
		h.logger.Error("删除评论失败", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "msg": err.Error()})
		return
	}
	h.logger.Info("删除评论成功", zap.String("id", id))
	c.JSON(http.StatusOK, gin.H{"code": 0, "msg": "success"})
}

// ========== 标签管理 ==========

// GET /api/admin/tags - 获取所有标签（仅查询 tags 列）
func (h *AdminHandler) ListTags(c *gin.Context) {
	var tagList []string
	h.db.Model(&model.Article{}).Pluck("tags", &tagList)

	tagSet := make(map[string]struct{})
	for _, tags := range tagList {
		if tags == "" {
			continue
		}
		for _, t := range strings.Split(tags, ",") {
			if t = strings.TrimSpace(t); t != "" {
				tagSet[t] = struct{}{}
			}
		}
	}
	result := make([]string, 0, len(tagSet))
	for t := range tagSet {
		result = append(result, t)
	}
	c.JSON(http.StatusOK, gin.H{"code": 0, "msg": "success", "data": result})
}

// markdownToHTML 使用 goldmark 将 Markdown 转为 HTML
func markdownToHTML(md string) string {
	var buf bytes.Buffer
	if err := goldmark.Convert([]byte(md), &buf); err != nil {
		return md // 降级返回原文
	}
	return buf.String()
}
