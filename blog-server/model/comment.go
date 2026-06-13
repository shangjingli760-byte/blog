// 评论数据模型，与数据库 comments 表对应
package model

import "time"

type Comment struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	ArticleID uint      `gorm:"index;not null" json:"article_id"`
	Nickname  string    `gorm:"size:100;not null" json:"nickname"`
	Email     string    `gorm:"size:200;not null" json:"email"`       // 留言必须填写邮箱
	Content   string    `gorm:"type:text;not null" json:"content"`
	CreatedAt time.Time `json:"created_at"`
}
