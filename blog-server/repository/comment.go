// 评论数据访问层，封装 GORM 操作
package repository

import (
	"blog-server/model"

	"gorm.io/gorm"
)

type CommentRepository struct {
	db *gorm.DB
}

func NewCommentRepository(db *gorm.DB) *CommentRepository {
	return &CommentRepository{db: db}
}

// 获取指定文章的评论列表
func (r *CommentRepository) FindByArticleID(articleID uint) ([]model.Comment, error) {
	var comments []model.Comment
	err := r.db.Where("article_id = ?", articleID).Order("created_at DESC").Find(&comments).Error
	return comments, err
}

// 创建评论
func (r *CommentRepository) Create(comment *model.Comment) error {
	return r.db.Create(comment).Error
}

// 删除评论
func (r *CommentRepository) Delete(id uint) error {
	return r.db.Delete(&model.Comment{}, id).Error
}
