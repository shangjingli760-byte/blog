// Blog 后端入口，仅负责初始化配置、数据库、路由并启动服务
package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

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
	db, err := gorm.Open(sqlite.Open(cfg.DBPath), &gorm.Config{})
	if err != nil {
		logger.Fatal("数据库连接失败", zap.Error(err))
	}

	// 配置数据库连接池
	sqlDB, err := db.DB()
	if err != nil {
		logger.Fatal("获取数据库实例失败", zap.Error(err))
	}
	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(5)
	sqlDB.SetConnMaxLifetime(5 * time.Minute)

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
	r := router.Setup(cfg, logger, articleSvc, commentSvc, db)

	addr := fmt.Sprintf(":%s", cfg.Port)

	srv := &http.Server{
		Addr:    addr,
		Handler: r,
	}

	// 在 goroutine 中启动服务器
	go func() {
		logger.Info("服务启动", zap.String("addr", addr))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("服务启动失败", zap.Error(err))
		}
	}()

	// 等待中断信号以优雅关闭服务器
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	logger.Info("正在关闭服务器...")

	// 设置 5 秒超时上下文
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		logger.Fatal("服务器强制关闭", zap.Error(err))
	}

	logger.Info("服务器已退出")
}
