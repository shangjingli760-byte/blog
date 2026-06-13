// 文章数据模型，与数据库 articles 表对应
package model

import "time"

type Article struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Title     string    `gorm:"size:200;not null" json:"title"`
	Slug      string    `gorm:"uniqueIndex;size:200;not null" json:"slug"`
	Content   string    `gorm:"type:text;not null" json:"content"`    // Markdown 原文
	HTML      string    `gorm:"type:text;not null" json:"html"`       // 渲染后的 HTML
	Summary   string    `gorm:"size:500" json:"summary"`
	Tags      string    `gorm:"size:500" json:"tags"`                 // 逗号分隔的标签
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
