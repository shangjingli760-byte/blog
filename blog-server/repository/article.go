// 文章数据访问层，封装 GORM 操作
package repository

import (
	"blog-server/model"

	"gorm.io/gorm"
)

type ArticleRepository struct {
	db *gorm.DB
}

func NewArticleRepository(db *gorm.DB) *ArticleRepository {
	return &ArticleRepository{db: db}
}

// 获取所有文章（按创建时间倒序）
func (r *ArticleRepository) FindAll() ([]model.Article, error) {
	var articles []model.Article
	err := r.db.Order("created_at DESC").Find(&articles).Error
	return articles, err
}

// 通过 slug 获取单篇文章
func (r *ArticleRepository) FindBySlug(slug string) (*model.Article, error) {
	var article model.Article
	err := r.db.Where("slug = ?", slug).First(&article).Error
	if err != nil {
		return nil, err
	}
	return &article, nil
}

// 创建文章
func (r *ArticleRepository) Create(article *model.Article) error {
	return r.db.Create(article).Error
}

// 更新文章
func (r *ArticleRepository) Update(article *model.Article) error {
	return r.db.Save(article).Error
}

// 删除文章
func (r *ArticleRepository) Delete(id uint) error {
	return r.db.Delete(&model.Article{}, id).Error
}
