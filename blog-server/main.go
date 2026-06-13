// Blog 后端入口，仅负责初始化配置、数据库、路由并启动服务
package main

import (
	"fmt"
	"log"
	"os"

	"blog-server/config"
	"blog-server/model"
	"blog-server/repository"
	"blog-server/router"
	"blog-server/service"

	"github.com/glebarez/sqlite"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func main() {
	// 加载配置
	cfg := config.Load()

	// 初始化日志
	logger, err := zap.NewProduction()
	if err != nil {
		log.Fatalf("初始化日志失败: %v", err)
	}
	defer logger.Sync()

	// 初始化数据库
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = cfg.DBPath
	}
	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		logger.Fatal("数据库连接失败", zap.Error(err))
	}

	// 自动迁移表结构
	if err := db.AutoMigrate(&model.Article{}, &model.Comment{}); err != nil {
		logger.Fatal("数据库迁移失败", zap.Error(err))
	}

	// 初始化依赖（构造函数注入）
	articleRepo := repository.NewArticleRepository(db)
	commentRepo := repository.NewCommentRepository(db)
	articleSvc := service.NewArticleService(articleRepo)
	commentSvc := service.NewCommentService(commentRepo)

	// 启动服务
	r := router.Setup(logger, articleSvc, commentSvc, db)
	addr := fmt.Sprintf(":%s", cfg.Port)
	logger.Info("服务启动", zap.String("addr", addr))
	if err := r.Run(addr); err != nil {
		logger.Fatal("服务启动失败", zap.Error(err))
	}
}
