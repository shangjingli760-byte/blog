// 配置管理，所有配置优先从环境变量读取，禁止硬编码
package config

import "os"

type Config struct {
	Port          string
	DBPath        string
	JWTSecret     string
	AdminUser     string
	AdminPassword string
}

func Load() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "./data/blog.db"
	}
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "blog-jwt-secret-change-in-production"
	}
	adminUser := os.Getenv("ADMIN_USER")
	if adminUser == "" {
		adminUser = "admin"
	}
	adminPassword := os.Getenv("ADMIN_PASSWORD")
	if adminPassword == "" {
		adminPassword = "admin123"
	}
	return &Config{
		Port:          port,
		DBPath:        dbPath,
		JWTSecret:     jwtSecret,
		AdminUser:     adminUser,
		AdminPassword: adminPassword,
	}
}
