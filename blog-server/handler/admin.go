// 管理端接口处理层：登录、文章 CRUD、评论管理
package handler

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"blog-server/config"
	"blog-server/model"
	"blog-server/service"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
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
	// 验证用户名
	if req.Username != h.cfg.AdminUser {
		h.logger.Warn("登录失败：用户名错误", zap.String("user", req.Username))
		c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "msg": "用户名或密码错误"})
		return
	}

	// 使用 bcrypt 验证密码（支持明文向后兼容和 bcrypt 哈希）
	err := bcrypt.CompareHashAndPassword([]byte(h.cfg.AdminPassword), []byte(req.Password))
	if err != nil {
		// 如果 bcrypt 验证失败，尝试明文比对（向后兼容，不推荐）
		if req.Password != h.cfg.AdminPassword {
			h.logger.Warn("登录失败：密码错误", zap.String("user", req.Username))
			c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "msg": "用户名或密码错误"})
			return
		}
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

// POST /api/admin/articles - 创建/导入文章（接收 Markdown 内容，自动转 HTML）
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

// PUT /api/admin/articles/:id - 编辑文章
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

// DELETE /api/admin/articles/:id - 删除文章
func (h *AdminHandler) DeleteArticle(c *gin.Context) {
	article, err := h.articleSvc.GetArticleBySlug(c.Param("slug"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "msg": "文章不存在"})
		return
	}
	if err := h.articleSvc.DeleteArticle(article.ID); err != nil {
		h.logger.Error("删除文章失败", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "msg": "服务端错误"})
		return
	}
	// 同时删除关联评论
	h.db.Where("article_id = ?", article.ID).Delete(&model.Comment{})
	h.logger.Info("删除文章成功", zap.Uint("id", article.ID))
	c.JSON(http.StatusOK, gin.H{"code": 0, "msg": "success"})
}

// ========== 评论管理 ==========

// GET /api/admin/comments - 评论列表（分页）
func (h *AdminHandler) ListComments(c *gin.Context) {
	var comments []model.Comment
	h.db.Order("created_at DESC").Find(&comments)
	h.logger.Info("获取评论列表", zap.Int("count", len(comments)))
	c.JSON(http.StatusOK, gin.H{"code": 0, "msg": "success", "data": comments})
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

// GET /api/admin/tags - 获取所有标签
func (h *AdminHandler) ListTags(c *gin.Context) {
	var articles []model.Article
	h.db.Select("tags").Find(&articles)
	tagSet := make(map[string]bool)
	for _, a := range articles {
		if a.Tags == "" {
			continue
		}
		for _, t := range strings.Split(a.Tags, ",") {
			t = strings.TrimSpace(t)
			if t != "" {
				tagSet[t] = true
			}
		}
	}
	tags := make([]string, 0, len(tagSet))
	for t := range tagSet {
		tags = append(tags, t)
	}
	c.JSON(http.StatusOK, gin.H{"code": 0, "msg": "success", "data": tags})
}

// 简易 Markdown → HTML 转换（后续可替换为 goldmark 等专业库）
// 当前处理：标题、加粗、链接、图片、代码块、段落
func markdownToHTML(md string) string {
	lines := strings.Split(md, "\n")
	var result strings.Builder
	inCodeBlock := false

	for i := 0; i < len(lines); i++ {
		line := lines[i]

		// 代码块
		if strings.HasPrefix(line, "```") {
			if inCodeBlock {
				result.WriteString("</code></pre>\n")
				inCodeBlock = false
			} else {
				result.WriteString("<pre><code>")
				inCodeBlock = true
			}
			continue
		}
		if inCodeBlock {
			result.WriteString(line + "\n")
			continue
		}

		trimmed := strings.TrimSpace(line)
		if trimmed == "" {
			continue
		}

		// 标题 ## ###
		if strings.HasPrefix(trimmed, "### ") {
			result.WriteString("<h3>" + trimmed[4:] + "</h3>\n")
		} else if strings.HasPrefix(trimmed, "## ") {
			result.WriteString("<h2>" + trimmed[3:] + "</h2>\n")
		} else if strings.HasPrefix(trimmed, "# ") {
			result.WriteString("<h1>" + trimmed[2:] + "</h1>\n")
		} else if strings.HasPrefix(trimmed, "- ") || strings.HasPrefix(trimmed, "* ") {
			result.WriteString("<li>" + processInline(line[2:]) + "</li>\n")
		} else {
			result.WriteString("<p>" + processInline(line) + "</p>\n")
		}
	}
	if inCodeBlock {
		result.WriteString("</code></pre>\n")
	}
	return result.String()
}

// 处理行内格式：加粗、斜体、链接、图片、代码
func processInline(text string) string {
	// 图片 ![alt](url)
	for {
		start := strings.Index(text, "![")
		if start == -1 {
			break
		}
		end := strings.Index(text[start:], "](")
		close := strings.Index(text[start+end+2:], ")")
		if end == -1 || close == -1 {
			break
		}
		end += start
		close += end + 2
		alt := text[start+2 : end]
		url := text[end+2 : close]
		text = text[:start] + fmt.Sprintf(`<img src="%s" alt="%s" />`, url, alt) + text[close+1:]
	}
	// 链接 [text](url)
	for {
		start := strings.Index(text, "[")
		if start == -1 {
			break
		}
		end := strings.Index(text[start:], "](")
		close := strings.Index(text[start+end+2:], ")")
		if end == -1 || close == -1 {
			break
		}
		end += start
		close += end + 2
		linkText := text[start+1 : end]
		url := text[end+2 : close]
		text = text[:start] + fmt.Sprintf(`<a href="%s">%s</a>`, url, linkText) + text[close+1:]
	}
	// 加粗 **text**
	for {
		start := strings.Index(text, "**")
		if start == -1 {
			break
		}
		end := strings.Index(text[start+2:], "**")
		if end == -1 {
			break
		}
		end += start + 2
		text = text[:start] + "<strong>" + text[start+2:end] + "</strong>" + text[end+2:]
	}
	// 行内代码 `code`
	for {
		start := strings.Index(text, "`")
		if start == -1 {
			break
		}
		end := strings.Index(text[start+1:], "`")
		if end == -1 {
			break
		}
		end += start + 1
		text = text[:start] + "<code>" + text[start+1:end] + "</code>" + text[end+1:]
	}
	return text
}
