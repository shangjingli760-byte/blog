// 文章业务逻辑层
package service

import (
	"blog-server/model"
	"blog-server/repository"
	"errors"
)

type ArticleService struct {
	repo *repository.ArticleRepository
}

func NewArticleService(repo *repository.ArticleRepository) *ArticleService {
	return &ArticleService{repo: repo}
}

// 获取文章列表
func (s *ArticleService) GetArticles() ([]model.Article, error) {
	return s.repo.FindAll()
}

// 根据 slug 获取文章详情
func (s *ArticleService) GetArticleBySlug(slug string) (*model.Article, error) {
	return s.repo.FindBySlug(slug)
}

// 创建文章
func (s *ArticleService) CreateArticle(article *model.Article) error {
	if article.Title == "" || article.Slug == "" || article.Content == "" {
		return errors.New("标题、slug、内容不能为空")
	}
	return s.repo.Create(article)
}

// 更新文章
func (s *ArticleService) UpdateArticle(article *model.Article) error {
	if article.Title == "" || article.Content == "" {
		return errors.New("标题和内容不能为空")
	}
	return s.repo.Update(article)
}

// 删除文章
func (s *ArticleService) DeleteArticle(id uint) error {
	return s.repo.Delete(id)
}
