// 路由注册，仅负责路由分组与中间件绑定，不包含业务逻辑
package router

import (
	"blog-server/handler"
	"blog-server/middleware"
	"blog-server/service"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func Setup(logger *zap.Logger, articleSvc *service.ArticleService, commentSvc *service.CommentService, tombSvc *service.TombService, db *gorm.DB) *gin.Engine {
	r := gin.New()

	// 全局中间件
	r.Use(middleware.LoggerMiddleware(logger))
	r.Use(middleware.RecoveryMiddleware(logger))
	r.Use(middleware.CORS())

	// 健康检查
	healthH := handler.NewHealthHandler(db)
	r.GET("/api/health", healthH.Check)

	// === 公开 API ===
	articleH := handler.NewArticleHandler(articleSvc, logger)
	r.GET("/api/articles", articleH.List)
	r.GET("/api/articles/:slug", articleH.Detail)

	commentH := handler.NewCommentHandler(commentSvc, articleSvc, logger)
	r.GET("/api/articles/:slug/comments", commentH.List)
	r.POST("/api/articles/:slug/comments", commentH.Create)

	// === 赛博墓碑 API ===
	tombH := handler.NewTombHandler(tombSvc, logger)
	r.GET("/api/tombs", tombH.List)
	r.GET("/api/tombs/:id", tombH.Detail)
	r.POST("/api/tombs", tombH.Create)
	r.DELETE("/api/tombs/:id", tombH.Delete)
	r.GET("/api/tombs/:id/visits", tombH.ListVisits)
	r.POST("/api/tombs/:id/visits", tombH.CreateVisit)
	r.POST("/api/tombs/:id/visitors", tombH.RecordVisitor)
	r.GET("/api/tombs/:id/visitors", tombH.ListVisitors)
	r.GET("/api/tombs/:id/stats", tombH.Stats)

	// === 管理端 API（需要 JWT 认证）===
	adminH := handler.NewAdminHandler(articleSvc, commentSvc, db, logger)
	r.POST("/api/admin/login", adminH.Login)

	admin := r.Group("/api/admin")
	admin.Use(middleware.AuthMiddleware())
	{
		// 文章管理
		admin.POST("/articles", adminH.CreateArticle)
		admin.PUT("/articles/:slug", adminH.UpdateArticle)
		admin.DELETE("/articles/:slug", adminH.DeleteArticle)

		// 评论管理
		admin.GET("/comments", adminH.ListComments)
		admin.DELETE("/comments/:id", adminH.DeleteComment)

		// 标签
		admin.GET("/tags", adminH.ListTags)
	}

	return r
}
